import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contactMessages } from "@/lib/content/contact";

const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I'd like to talk about Manut AI for our dealership.",
  topics: ["Manut AI"],
  company: "",
  elapsedMs: 12_000,
};

const fetchMock = vi.fn();

async function callRoute(body: string, headers: Record<string, string> = {}) {
  const { POST } = await import("./contact");
  const req = new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
  const res = await POST(req);
  return { status: res.status, json: (await res.json()) as Record<string, unknown> };
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('{"id":"email_1"}', { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    process.env.RESEND_API_KEY = "re_test";
    process.env.CONTACT_TO_EMAIL = "owner@example.com";
    process.env.CONTACT_FROM_EMAIL = "KunanonJ <contact@kunanonj.com>";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.RESEND_API_KEY;
    delete process.env.CONTACT_TO_EMAIL;
    delete process.env.CONTACT_FROM_EMAIL;
  });

  it("delivers a valid message and answers 200 with { ok, message } only", async () => {
    const { status, json } = await callRoute(JSON.stringify(VALID));
    expect(status).toBe(200);
    expect(json).toEqual({ ok: true, message: contactMessages.sent });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0]![0])).toBe("https://api.resend.com/emails");
  });

  it("answers 400 for invalid JSON", async () => {
    const { status, json } = await callRoute("{not json");
    expect(status).toBe(400);
    expect(json.ok).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 400 for a missing field without echoing input", async () => {
    const { status, json } = await callRoute(JSON.stringify({ ...VALID, email: "<b>x</b>" }));
    expect(status).toBe(400);
    expect(json).toEqual({ ok: false, message: contactMessages.invalidEmail });
  });

  it("answers 503 when Resend isn't configured", async () => {
    delete process.env.CONTACT_FROM_EMAIL;
    const { status, json } = await callRoute(JSON.stringify(VALID));
    expect(status).toBe(503);
    expect(json).toEqual({ ok: false, message: contactMessages.notConfigured });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 413 for an oversized body before parsing it", async () => {
    const { status, json } = await callRoute(JSON.stringify(VALID), {
      "content-length": "50000",
    });
    expect(status).toBe(413);
    expect(json).toEqual({ ok: false, message: contactMessages.tooLarge });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 502 when Resend rejects the send", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 422 }));
    const { status, json } = await callRoute(JSON.stringify(VALID));
    expect(status).toBe(502);
    expect(json).toEqual({ ok: false, message: contactMessages.failed });
  });
});
