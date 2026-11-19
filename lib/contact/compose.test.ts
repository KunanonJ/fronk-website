import { describe, expect, it } from "vitest";
import { MAILTO_MAX, composeContactEmail } from "@/lib/contact/compose";
import { contactPage } from "@/lib/content/contact";

const decode = (href: string) => {
  const url = new URL(href);
  return {
    to: decodeURIComponent(url.pathname),
    subject: url.searchParams.get("subject"),
    body: url.searchParams.get("body"),
  };
};

describe("composeContactEmail", () => {
  it("addresses the public inbox, names the topics and the sender", () => {
    const email = composeContactEmail({
      name: "  Ada Lovelace ",
      message: "  We are hiring a forward deployed engineer.  ",
      topics: ["Hiring", "Partnership"],
    });
    expect(email.to).toBe(contactPage.email);
    expect(email.subject).toBe(
      "Hiring, Partnership: Ada Lovelace via kunanonj.com",
    );
    expect(email.body).toBe(
      "We are hiring a forward deployed engineer.\n\nAda Lovelace",
    );
  });

  it("leaves the topics out of the subject when none is chosen", () => {
    expect(
      composeContactEmail({ name: "Ada", message: "Hello there.", topics: [] })
        .subject,
    ).toBe("Ada via kunanonj.com");
  });

  it("builds a mailto link that carries the subject and body intact", () => {
    const email = composeContactEmail({
      name: "Ada & Co",
      message: "Line one?\nLine two: 100% sure #1",
      topics: ["Something else"],
    });
    expect(email.href.startsWith(`mailto:${contactPage.email}?`)).toBe(true);
    const parsed = decode(email.href);
    expect(parsed.to).toBe(contactPage.email);
    expect(parsed.subject).toBe(email.subject);
    // Line breaks travel as CRLF, as mailto bodies expect.
    expect(parsed.body).toBe(email.body.replace(/\n/g, "\r\n"));
    // Spaces as %20: an email app shows a form-style "+" as a plus sign.
    expect(email.href).not.toContain("+");
    expect(email.href).toContain("Line%20one");
    expect(email.complete).toBe(true);
  });

  it("keeps the name to one line, as a subject must be", () => {
    const email = composeContactEmail({
      name: "Ada\r\nBcc: someone@example.com",
      message: "Hello there.",
      topics: [],
    });
    expect(email.subject).toBe("Ada Bcc: someone@example.com via kunanonj.com");
    // No line break reaches the subject (the body's are its own lines).
    expect(email.href.split("&body=")[0]).not.toMatch(/%0[AD]/);
  });

  it("encodes a draft that carries a lone surrogate instead of throwing", () => {
    const email = composeContactEmail({
      name: "Ada \uD800",
      message: "Hi \uDC00 there 😀",
      topics: [],
    });
    expect(email.subject).toBe("Ada � via kunanonj.com");
    expect(email.body).toBe("Hi � there 😀\n\nAda �");
    expect(decodeURIComponent(email.href.split("&body=")[1])).toBe(
      "Hi � there 😀\r\n\r\nAda �",
    );
  });

  it("leaves the body out of a link that would pass the Windows limit", () => {
    const fits = composeContactEmail({
      name: "Ada",
      message: "a".repeat(1800),
      topics: [],
    });
    expect(fits.complete).toBe(true);
    expect(fits.href.length).toBeLessThanOrEqual(MAILTO_MAX);

    // 400 Thai letters take 3,600 characters once encoded.
    const long = composeContactEmail({
      name: "Ada",
      message: "ก".repeat(400),
      topics: ["Hiring"],
    });
    expect(long.complete).toBe(false);
    expect(long.body).toBe(`${"ก".repeat(400)}\n\nAda`);
    expect(long.href).toBe(
      `mailto:${contactPage.email}?subject=${encodeURIComponent("Hiring: Ada via kunanonj.com")}`,
    );
  });
});
