import { describe, expect, it } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import { getAllPortfolioProjects } from "@/lib/content/portfolio";
import { getAllVentures } from "@/lib/content/ventures";
import { buildSiteJsonLd } from "@/lib/seo/jsonLd";
import {
  MAX_TITLE_LENGTH,
  TITLE_SUFFIX,
  namedPageTitle,
} from "@/lib/seo/pageTitle";
import { siteConfig } from "@/lib/site";

describe("namedPageTitle", () => {
  it("keeps the tagline when the full title fits, without its trailing period", () => {
    expect(namedPageTitle("GoGoCash", "Shopping-to-earn cashback.")).toBe(
      "GoGoCash: Shopping-to-earn cashback",
    );
  });

  it("falls back to the name when the tagline would make the title too long", () => {
    expect(
      namedPageTitle(
        "Manut AI",
        "ERP/CRM workspace with Intelligence AI for automotive SMEs.",
      ),
    ).toBe("Manut AI");
  });

  it("returns the name when there is no tagline", () => {
    expect(namedPageTitle("Portfolio")).toBe("Portfolio");
    expect(namedPageTitle("Portfolio", "   ")).toBe("Portfolio");
  });

  it("matches the suffix the root layout template appends", () => {
    expect(TITLE_SUFFIX).toBe(` — ${siteConfig.name}`);
  });
});

describe("page titles stay short enough for results and sitelinks", () => {
  it("every venture and portfolio title fits in 60 characters with the suffix", () => {
    const titles = [
      ...getAllVentures().map((v) => namedPageTitle(v.name, v.tagline)),
      ...getAllPortfolioProjects().map((p) => namedPageTitle(p.name, p.tagline)),
    ];
    for (const title of titles) {
      expect((title + TITLE_SUFFIX).length, title).toBeLessThanOrEqual(
        MAX_TITLE_LENGTH,
      );
    }
  });

  it("the about title fits on its own and names the person once", () => {
    const { title } = aboutPage.meta;
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(title).toContain("Kunanon Jarat");
    expect(title.match(/Kunanon Jarat/g)).toHaveLength(1);
  });
});

describe("WebSite structured data", () => {
  it("gives Google alternate site names", () => {
    const graph = buildSiteJsonLd()["@graph"] as Record<string, unknown>[];
    const site = graph.find((n) => n["@type"] === "WebSite");
    expect(site?.alternateName).toEqual(
      expect.arrayContaining(["Kunanon Jarat", "KunanonJ"]),
    );
  });
});
