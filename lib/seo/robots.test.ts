import { describe, expect, it } from "vitest";
import robots, { CONTENT_SIGNAL } from "./robots";
import { PLACEHOLDER_SITE_URL } from "@/lib/seo/siteUrl";

describe("robots()", () => {
  it("never points Host or Sitemap at the example placeholder", () => {
    const doc = robots();
    expect(doc.host).toBeTruthy();
    expect(String(doc.host)).not.toContain("example.com");
    expect(String(doc.sitemap)).not.toContain("example.com");
    expect(String(doc.sitemap)).toMatch(/\/sitemap\.xml$/);
    expect(String(doc.host)).not.toBe(PLACEHOLDER_SITE_URL);
  });

  it("allows citation bots and blocks training scrapers", () => {
    const doc = robots();
    const rules = Array.isArray(doc.rules) ? doc.rules : [doc.rules];
    const byUa = new Map(rules.map((r) => [String(r.userAgent), r] as const));

    expect(byUa.get("ChatGPT-User")?.allow).toBeDefined();
    expect(byUa.get("PerplexityBot")?.allow).toBeDefined();
    expect(byUa.get("Claude-SearchBot")?.allow).toBeDefined();

    const cc = byUa.get("CCBot");
    expect(cc?.disallow).toBeDefined();
    const ccDisallow = cc?.disallow;
    const list = Array.isArray(ccDisallow) ? ccDisallow : [ccDisallow];
    expect(list).toContain("/");
  });

  it("gives the content signals to every group that allows crawling, and only those", () => {
    expect(CONTENT_SIGNAL).toBe("search=yes, ai-input=yes, ai-train=yes");
    const rules = robots().rules;
    for (const rule of Array.isArray(rules) ? rules : [rules]) {
      const agent = String(rule.userAgent);
      if (rule.allow) expect(rule.contentSignal, agent).toBe(CONTENT_SIGNAL);
      else expect(rule.contentSignal, agent).toBeUndefined();
    }
  });
});
