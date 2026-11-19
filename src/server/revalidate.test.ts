import { encodeSignatureHeader } from "@sanity/webhook";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_WEBHOOK_BYTES,
  WEBHOOK_MAX_AGE_MS,
  handleSanityWebhook,
} from "./revalidate";

const SECRET = "test-secret";

async function signed(body: unknown, secret = SECRET, timestamp = Date.now()) {
  const payload = JSON.stringify(body);
  const signature = await encodeSignatureHeader(payload, timestamp, secret);
  return new Request("https://kunanonj.com/api/revalidate", {
    method: "POST",
    headers: {
      "sanity-webhook-signature": signature,
      "content-type": "application/json",
    },
    body: payload,
  });
}

afterEach(() => vi.restoreAllMocks());

describe("handleSanityWebhook", () => {
  it("purges the tags mapped from the document type", async () => {
    const purge = vi.fn().mockResolvedValue({ success: true });
    const res = await handleSanityWebhook(
      await signed({ _type: "post" }),
      SECRET,
      { purge },
    );
    expect(res.status).toBe(200);
    expect(purge).toHaveBeenCalledWith({ tags: ["posts"] });
    expect(await res.json()).toMatchObject({
      status: 200,
      revalidated: true,
      tags: ["posts"],
    });
  });

  it("rejects a bad signature without purging", async () => {
    const purge = vi.fn();
    const res = await handleSanityWebhook(
      await signed({ _type: "post" }, "other-secret"),
      SECRET,
      { purge },
    );
    expect(res.status).toBe(401);
    expect(purge).not.toHaveBeenCalled();
  });

  it("rejects a replay of a signed request older than the window", async () => {
    const purge = vi.fn();
    const old = Date.now() - WEBHOOK_MAX_AGE_MS - 1000;
    const res = await handleSanityWebhook(
      await signed({ _type: "post" }, SECRET, old),
      SECRET,
      { purge },
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ message: "Stale signature" });
    expect(purge).not.toHaveBeenCalled();
  });

  it("rejects a missing signature and a missing secret", async () => {
    const unsigned = new Request("https://kunanonj.com/api/revalidate", {
      method: "POST",
      body: "{}",
    });
    expect(
      (await handleSanityWebhook(unsigned, SECRET, undefined)).status,
    ).toBe(401);
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const unconfigured = await handleSanityWebhook(
      await signed({}),
      undefined,
      undefined,
    );
    expect(unconfigured.status).toBe(500);
    // The setting's name reaches the log, not the caller.
    expect(await unconfigured.text()).not.toContain("SANITY");
    expect(String(logged.mock.calls[0]?.[0])).toContain(
      "SANITY_REVALIDATE_SECRET",
    );
  });

  it("refuses an unsigned request without reading its body", async () => {
    const body = new ReadableStream<Uint8Array>({
      pull() {
        throw new Error("the body was read");
      },
    });
    const unsigned = new Request("https://kunanonj.com/api/revalidate", {
      method: "POST",
      body,
      // @ts-expect-error Node's fetch needs `duplex` for a stream body.
      duplex: "half",
    });
    const res = await handleSanityWebhook(unsigned, SECRET, undefined);
    expect(res.status).toBe(401);
    expect(unsigned.bodyUsed).toBe(false);
  });

  it("answers 413 to a signed body over the limit, without purging", async () => {
    const purge = vi.fn();
    const big = "x".repeat(MAX_WEBHOOK_BYTES + 1);
    const signature = await encodeSignatureHeader(big, Date.now(), SECRET);
    const res = await handleSanityWebhook(
      new Request("https://kunanonj.com/api/revalidate", {
        method: "POST",
        headers: { "sanity-webhook-signature": signature },
        body: big,
      }),
      SECRET,
      { purge },
    );
    expect(res.status).toBe(413);
    expect(purge).not.toHaveBeenCalled();
  });

  // A failed purge answers 500, so Sanity retries the delivery twice, and
  // it is logged, so the Worker's logs show it. Its body says 500 too.
  it("reports and logs failure when the Worker cache is not enabled", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleSanityWebhook(
      await signed({ _type: "resumeProfile" }),
      SECRET,
      undefined,
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      status: 500,
      revalidated: false,
      tags: ["resume"],
    });
    expect(logged).toHaveBeenCalledWith(
      "[revalidate] cache purge failed",
      ["resume"],
      ["Worker cache is not enabled"],
    );
  });

  it("reports and logs a purge Cloudflare did not accept", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const errors = [{ code: 1, message: "rate limited" }];
    const purge = vi.fn().mockResolvedValue({ success: false, errors });
    const res = await handleSanityWebhook(
      await signed({ _type: "post" }),
      SECRET,
      { purge },
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      status: 500,
      revalidated: false,
    });
    expect(logged).toHaveBeenCalledWith(
      "[revalidate] cache purge failed",
      ["posts"],
      errors,
    );
  });

  it("reports and logs a purge that throws", async () => {
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const purge = vi.fn().mockRejectedValue(new Error("purge unavailable"));
    const res = await handleSanityWebhook(
      await signed({ _type: "writingPage" }),
      SECRET,
      { purge },
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      status: 500,
      revalidated: false,
      tags: ["writing"],
    });
    expect(logged).toHaveBeenCalledWith(
      "[revalidate] cache purge failed",
      ["writing"],
      ["purge unavailable"],
    );
  });
});
