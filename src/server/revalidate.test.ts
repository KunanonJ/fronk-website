import { encodeSignatureHeader } from "@sanity/webhook";
import { describe, expect, it, vi } from "vitest";
import {
  ALL_CONTENT_TAGS,
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
    expect(
      (await handleSanityWebhook(await signed({}), undefined, undefined))
        .status,
    ).toBe(500);
  });

  it("reports failure when the Worker cache is not enabled", async () => {
    const res = await handleSanityWebhook(
      await signed({ _type: "resumeProfile" }),
      SECRET,
      undefined,
    );
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({
      revalidated: false,
      tags: ["resume"],
    });
  });

  it("knows every content tag for the hourly purge", () => {
    expect(ALL_CONTENT_TAGS).toEqual(["resume", "posts", "writing"]);
  });
});
