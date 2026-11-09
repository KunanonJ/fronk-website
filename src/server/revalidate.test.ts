import { encodeSignatureHeader } from "@sanity/webhook";
import { describe, expect, it, vi } from "vitest";
import { ALL_CONTENT_TAGS, handleCronRequest, handleSanityWebhook } from "./revalidate";

const SECRET = "test-secret";

async function signed(body: unknown, secret = SECRET) {
  const payload = JSON.stringify(body);
  const signature = await encodeSignatureHeader(payload, Date.now(), secret);
  return new Request("https://kunanonj.com/api/revalidate", {
    method: "POST",
    headers: { "sanity-webhook-signature": signature, "content-type": "application/json" },
    body: payload,
  });
}

describe("handleSanityWebhook", () => {
  it("purges the tags mapped from the document type", async () => {
    const purge = vi.fn().mockResolvedValue({ success: true });
    const res = await handleSanityWebhook(await signed({ _type: "post" }), SECRET, { purge });
    expect(res.status).toBe(200);
    expect(purge).toHaveBeenCalledWith({ tags: ["posts"] });
    expect(await res.json()).toMatchObject({ revalidated: true, tags: ["posts"] });
  });

  it("rejects a bad signature without purging", async () => {
    const purge = vi.fn();
    const res = await handleSanityWebhook(await signed({ _type: "post" }, "other-secret"), SECRET, { purge });
    expect(res.status).toBe(401);
    expect(purge).not.toHaveBeenCalled();
  });

  it("rejects a missing signature and a missing secret", async () => {
    const unsigned = new Request("https://kunanonj.com/api/revalidate", { method: "POST", body: "{}" });
    expect((await handleSanityWebhook(unsigned, SECRET, undefined)).status).toBe(401);
    expect((await handleSanityWebhook(await signed({}), undefined, undefined)).status).toBe(500);
  });

  it("reports failure when the Worker cache is not enabled", async () => {
    const res = await handleSanityWebhook(await signed({ _type: "resumeProfile" }), SECRET, undefined);
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ revalidated: false, tags: ["resume"] });
  });

  it("knows every content tag for the hourly purge", () => {
    expect(ALL_CONTENT_TAGS).toEqual(["site", "home", "pages", "ventures", "resume", "posts", "writing"]);
  });
});

describe("handleCronRequest (bridge for the old cron Worker)", () => {
  const get = (auth?: string) =>
    new Request("https://kunanonj.com/api/cron/revalidate", { headers: auth ? { authorization: auth } : {} });

  it("purges every content tag with the right bearer secret", async () => {
    const purge = vi.fn().mockResolvedValue({ success: true });
    const res = await handleCronRequest(get("Bearer s3"), "s3", { purge });
    expect(res.status).toBe(200);
    expect(purge).toHaveBeenCalledWith({ tags: ALL_CONTENT_TAGS });
  });

  it("rejects a wrong or missing secret", async () => {
    const purge = vi.fn();
    expect((await handleCronRequest(get("Bearer nope"), "s3", { purge })).status).toBe(401);
    expect((await handleCronRequest(get(), undefined, { purge })).status).toBe(500);
    expect(purge).not.toHaveBeenCalled();
  });
});

