import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS, isCrossSite, methodNotAllowed, readBodyText, withSecurityHeaders } from "./http";

const post = (body: BodyInit | null, headers: Record<string, string> = {}) =>
  new Request("https://kunanonj.com/api/contact", { method: "POST", headers, body });

describe("withSecurityHeaders", () => {
  it("adds every header and keeps status, body and existing values", async () => {
    const res = withSecurityHeaders(
      new Response("hi", { status: 404, headers: { "X-Frame-Options": "DENY", "Content-Type": "text/plain" } }),
    );
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("hi");
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("content-type")).toBe("text/plain");
    for (const name of Object.keys(SECURITY_HEADERS).filter((n) => n !== "X-Frame-Options")) {
      expect(res.headers.get(name)).toBe(SECURITY_HEADERS[name]);
    }
  });

  it("works on redirects, whose headers are immutable when fetched", () => {
    const res = withSecurityHeaders(Response.redirect("https://kunanonj.com/about", 308));
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe("https://kunanonj.com/about");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
  });
});

describe("readBodyText", () => {
  it("returns the body under the limit", async () => {
    expect(await readBodyText(post('{"a":"ก"}'), 100)).toBe('{"a":"ก"}');
  });

  it("returns null when the declared length is over the limit", async () => {
    expect(await readBodyText(post("x", { "content-length": "500" }), 100)).toBeNull();
  });

  it("returns null when the streamed body is over the limit despite a small Content-Length", async () => {
    expect(await readBodyText(post("x".repeat(500), { "content-length": "10" }), 100)).toBeNull();
  });

  it("returns an empty string with no body", async () => {
    expect(await readBodyText(post(null), 100)).toBe("");
  });
});

describe("isCrossSite", () => {
  it("allows same-origin browsers and clients without fetch metadata", () => {
    expect(isCrossSite(post("", { "sec-fetch-site": "same-origin", origin: "https://kunanonj.com" }))).toBe(false);
    expect(isCrossSite(post(""))).toBe(false);
  });

  it("rejects cross-site and same-site requests and foreign origins", () => {
    expect(isCrossSite(post("", { "sec-fetch-site": "cross-site" }))).toBe(true);
    expect(isCrossSite(post("", { "sec-fetch-site": "same-site" }))).toBe(true);
    expect(isCrossSite(post("", { origin: "https://evil.example" }))).toBe(true);
  });
});

describe("methodNotAllowed", () => {
  it("answers 405 with Allow", () => {
    const res = methodNotAllowed("POST");
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });
});
