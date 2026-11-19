import { describe, expect, it } from "vitest";
import {
  projectJsonLd,
  ventureJsonLd,
} from "@/components/profile/case/caseJsonLd";
import { getPortfolioProjectBySlug } from "@/lib/content/portfolio";
import { getVentureBySlug } from "@/lib/content/ventures";
import { buildPortfolioProjectJsonLd } from "@/lib/seo/portfolioJsonLd";

/*
 * The preview case pages carry the live pages' structured data (plan step
 * 5h): the same types, the live addresses and the same order, so Phase 6 can
 * swap the body under an unchanged JSON-LD. The browser check compares the
 * two pages' scripts as served.
 */
describe("the case pages' JSON-LD", () => {
  it("gives a project its breadcrumb, then its CreativeWork, at the live addresses", () => {
    const project = getPortfolioProjectBySlug("tbh-intranet")!;
    const [crumbs, work] = projectJsonLd(project).map((json) =>
      JSON.parse(json),
    );
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(
      crumbs.itemListElement.map((item: { name: string; item: string }) => [
        item.name,
        new URL(item.item).pathname,
      ]),
    ).toEqual([
      ["Home", "/"],
      ["Portfolio", "/portfolio"],
      ["TBH Intranet", "/portfolio/tbh-intranet"],
    ]);
    expect(work).toEqual(
      JSON.parse(JSON.stringify(buildPortfolioProjectJsonLd(project))),
    );
  });

  it("gives a venture its SoftwareApplication with the offer, then its breadcrumb", () => {
    const venture = getVentureBySlug("gogocash")!;
    const [app, crumbs] = ventureJsonLd(venture).map((json) =>
      JSON.parse(json),
    );
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.name).toBe("GoGoCash");
    expect(app.url).toBe("https://gogocash.co");
    expect(app.offers).toBeDefined();
    expect(
      crumbs.itemListElement.map((item: { name: string }) => item.name),
    ).toEqual(["Home", "Ventures", "GoGoCash"]);
    expect(new URL(crumbs.itemListElement[1].item).hash).toBe("#ventures");
  });
});
