import { describe, expect, it, vi } from "vitest";
import { contactMessages } from "@/lib/content/contact";
import { guardForm } from "./formGuard";

const post = (body: unknown) =>
  new Request("https://kunanonj.com/api/contact", {
    method: "POST",
    headers: {
      "cf-connecting-ip": "203.0.113.7",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

describe("guardForm", () => {
  it("passes when no binding or secret is configured", async () => {
    expect(await guardForm(post({}), "contact", {})).toBeNull();
  });

  it("returns 429 when the rate limit is exceeded, keyed by scope and IP", async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    const res = await guardForm(post({}), "contact", {
      FORM_RATE_LIMIT: { limit },
    });
    expect(limit).toHaveBeenCalledWith({ key: "contact:203.0.113.7" });
    expect(res?.status).toBe(429);
    expect(await res?.json()).toEqual({
      ok: false,
      message: contactMessages.rateLimited,
    });
  });

  it("returns 403 without a Turnstile token once the secret is set", async () => {
    const res = await guardForm(
      post({}),
      "contact",
      { TURNSTILE_SECRET_KEY: "secret" },
      vi.fn(),
    );
    expect(res?.status).toBe(403);
  });

  it("verifies the token with siteverify and lets a valid one through", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ success: true }));
    const res = await guardForm(
      post({ turnstileToken: "tok" }),
      "contact",
      { TURNSTILE_SECRET_KEY: "secret" },
      fetcher,
    );
    expect(res).toBeNull();
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    );
    expect(String(init.body)).toContain("response=tok");
  });

  it("rejects a token siteverify refuses", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(Response.json({ success: false }));
    const res = await guardForm(
      post({ turnstileToken: "bad" }),
      "contact",
      { TURNSTILE_SECRET_KEY: "secret" },
      fetcher,
    );
    expect(res?.status).toBe(403);
  });
});
