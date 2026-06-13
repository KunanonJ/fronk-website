import { describe, expect, it, vi } from "vitest";
import { isValidEmail, subscribeEmail } from "./subscribe";

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    expect(isValidEmail("fronk@example.com")).toBe(true);
    expect(isValidEmail("a.b+tag@sub.domain.co")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["", "no-at", "a@b", "a@b.", "@x.com", "a b@x.com"]) {
      expect(isValidEmail(bad)).toBe(false);
    }
  });
});

const CONFIG = { apiKey: "re_test", audienceId: "aud_123" };
const okFetch = () =>
  vi.fn(
    async (_url: string | URL | Request, _init?: RequestInit) =>
      new Response(JSON.stringify({ id: "c1" }), { status: 201 }),
  );

describe("subscribeEmail", () => {
  it("rejects an invalid email with 400 before calling Resend", async () => {
    const f = okFetch();
    const r = await subscribeEmail("nope", CONFIG, f);
    expect(r).toMatchObject({ ok: false, status: 400 });
    expect(f).not.toHaveBeenCalled();
  });

  it("returns 503 when Resend isn't configured (no key/audience)", async () => {
    const f = okFetch();
    const r = await subscribeEmail("a@b.com", {}, f);
    expect(r).toMatchObject({ ok: false, status: 503 });
    expect(f).not.toHaveBeenCalled();
  });

  it("adds the contact to the audience on success", async () => {
    const f = okFetch();
    const r = await subscribeEmail("a@b.com", CONFIG, f);
    expect(r).toMatchObject({ ok: true, status: 200 });
    expect(f).toHaveBeenCalledOnce();
    const [url, init] = f.mock.calls[0]!;
    expect(String(url)).toContain("/audiences/aud_123/contacts");
    expect((init!.headers as Record<string, string>).Authorization).toBe(
      "Bearer re_test",
    );
    expect(JSON.parse(init!.body as string).email).toBe("a@b.com");
  });

  it("fails gracefully on a Resend error response", async () => {
    const f = vi.fn(async () => new Response("err", { status: 500 }));
    const r = await subscribeEmail("a@b.com", CONFIG, f);
    expect(r).toMatchObject({ ok: false, status: 502 });
  });

  it("fails gracefully when the request throws", async () => {
    const f = vi.fn(async () => {
      throw new Error("network down");
    });
    const r = await subscribeEmail("a@b.com", CONFIG, f);
    expect(r).toMatchObject({ ok: false, status: 502 });
  });
});
