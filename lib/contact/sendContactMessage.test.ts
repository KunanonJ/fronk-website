import { describe, expect, it, vi } from "vitest";
import { CONTACT_LIMITS, contactMessages } from "@/lib/content/contact";
import {
  buildSubject,
  parseContactInput,
  sendContactMessage,
  type ContactInput,
} from "./sendContactMessage";

const CONFIG = {
  apiKey: "re_test",
  to: "owner@example.com",
  from: "KunanonJ <contact@kunanonj.com>",
};

const VALID: ContactInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I'd like to talk about Manut AI for our dealership.",
  topics: ["Manut AI"],
  company: "",
  elapsedMs: 12_000,
};

const okFetch = () =>
  vi.fn<typeof fetch>(
    async () => new Response(JSON.stringify({ id: "email_1" }), { status: 200 }),
  );

function sentBody(f: ReturnType<typeof okFetch>) {
  const [, init] = f.mock.calls[0]!;
  return JSON.parse(init!.body as string) as Record<string, unknown>;
}

describe("parseContactInput", () => {
  it("coerces a well-formed body", () => {
    expect(parseContactInput({ ...VALID })).toEqual(VALID);
  });

  it("never throws on junk and yields empty strings", () => {
    for (const junk of [null, undefined, 42, "x", [], { name: 5, topics: "AI" }]) {
      const parsed = parseContactInput(junk);
      expect(parsed.name).toBe("");
      expect(parsed.topics).toEqual([]);
      expect(parsed.elapsedMs).toBeNull();
    }
  });

  it("drops unknown topics, dedupes, and caps the list", () => {
    const parsed = parseContactInput({
      ...VALID,
      topics: ["Hiring", "Hiring", "Website", 7, "GoGoCash"],
    });
    expect(parsed.topics).toEqual(["Hiring", "GoGoCash"]);
  });

  it("trims name, email and message", () => {
    const parsed = parseContactInput({
      ...VALID,
      name: "  Ada  ",
      email: " ada@example.com ",
      message: "  hello there friend  ",
    });
    expect(parsed).toMatchObject({
      name: "Ada",
      email: "ada@example.com",
      message: "hello there friend",
    });
  });
});

describe("buildSubject", () => {
  it("names the topics and sender", () => {
    expect(buildSubject({ ...VALID, topics: ["Hiring", "GoGoCash"] })).toBe(
      "[kunanonj.com] Hiring, GoGoCash from Ada Lovelace",
    );
  });

  it("falls back to 'Message' with no topics", () => {
    expect(buildSubject({ ...VALID, topics: [] })).toBe(
      "[kunanonj.com] Message from Ada Lovelace",
    );
  });

  it("strips line breaks and control characters (header injection)", () => {
    const subject = buildSubject({
      ...VALID,
      name: "Eve\r\nBcc: victim@example.com\u0007",
    });
    // eslint-disable-next-line no-control-regex -- asserting control characters are gone
    expect(subject).not.toMatch(/[\r\n\u0000-\u001f\u007f]/);
    expect(subject).toContain("Eve Bcc: victim@example.com");
  });

  it("caps the length", () => {
    expect(buildSubject({ ...VALID, name: "x".repeat(500) }).length).toBeLessThanOrEqual(150);
  });
});

describe("sendContactMessage", () => {
  it("sends one plain-text email with reply_to set to the visitor", async () => {
    const f = okFetch();
    const r = await sendContactMessage(VALID, CONFIG, f);

    expect(r).toEqual({ ok: true, status: 200, message: contactMessages.sent });
    expect(f).toHaveBeenCalledOnce();
    const [url, init] = f.mock.calls[0]!;
    expect(String(url)).toBe("https://api.resend.com/emails");
    expect(init!.method).toBe("POST");
    expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer re_test");

    const body = sentBody(f);
    expect(body).toMatchObject({
      from: CONFIG.from,
      to: [CONFIG.to],
      reply_to: "ada@example.com",
      subject: "[kunanonj.com] Manut AI from Ada Lovelace",
    });
    expect(body.html).toBeUndefined();
    expect(body.text).toContain("Ada Lovelace <ada@example.com>");
    expect(body.text).toContain("Topics: Manut AI");
    expect(body.text).toContain(VALID.message);
  });

  it("keeps visitor HTML as inert text", async () => {
    const f = okFetch();
    await sendContactMessage(
      { ...VALID, message: "<script>alert(1)</script> hello there" },
      CONFIG,
      f,
    );
    const body = sentBody(f);
    expect(body.html).toBeUndefined();
    expect(body.text).toContain("<script>alert(1)</script> hello there");
  });

  it.each([
    [{ name: "" }, contactMessages.invalidName],
    [{ name: "x".repeat(CONTACT_LIMITS.nameMax + 1) }, contactMessages.invalidName],
    [{ email: "nope" }, contactMessages.invalidEmail],
    [{ email: `${"a".repeat(250)}@x.com` }, contactMessages.invalidEmail],
    [{ message: "too short" }, contactMessages.messageTooShort],
    [{ message: "x".repeat(CONTACT_LIMITS.messageMax + 1) }, contactMessages.messageTooLong],
  ])("rejects %o with 400 before calling Resend", async (patch, message) => {
    const f = okFetch();
    const r = await sendContactMessage({ ...VALID, ...patch }, CONFIG, f);
    expect(r).toEqual({ ok: false, status: 400, message });
    expect(f).not.toHaveBeenCalled();
  });

  it("silently accepts but drops a filled honeypot", async () => {
    const f = okFetch();
    const r = await sendContactMessage({ ...VALID, company: "Spam Inc" }, CONFIG, f);
    expect(r).toEqual({ ok: true, status: 200, message: contactMessages.sent });
    expect(f).not.toHaveBeenCalled();
  });

  it("silently drops a submit faster than the minimum fill time", async () => {
    const f = okFetch();
    const r = await sendContactMessage(
      { ...VALID, elapsedMs: CONTACT_LIMITS.minFillMs - 1 },
      CONFIG,
      f,
    );
    expect(r.ok).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it("silently drops a submit with no timing (not from the form)", async () => {
    const f = okFetch();
    const r = await sendContactMessage({ ...VALID, elapsedMs: null }, CONFIG, f);
    expect(r.ok).toBe(true);
    expect(f).not.toHaveBeenCalled();
  });

  it.each([
    [{ apiKey: undefined }],
    [{ to: undefined }],
    [{ from: undefined }],
    [{ to: "  " }],
  ])("returns 503 when config %o is missing", async (patch) => {
    const f = okFetch();
    const r = await sendContactMessage(VALID, { ...CONFIG, ...patch }, f);
    expect(r).toEqual({ ok: false, status: 503, message: contactMessages.notConfigured });
    expect(f).not.toHaveBeenCalled();
  });

  it("returns 502 on a Resend error response", async () => {
    const f = vi.fn(async () => new Response('{"message":"domain not verified"}', { status: 403 }));
    const r = await sendContactMessage(VALID, CONFIG, f);
    expect(r).toEqual({ ok: false, status: 502, message: contactMessages.failed });
  });

  it("returns 502 when the request throws", async () => {
    const f = vi.fn(async () => {
      throw new Error("network down");
    });
    const r = await sendContactMessage(VALID, CONFIG, f);
    expect(r).toEqual({ ok: false, status: 502, message: contactMessages.failed });
  });
});
