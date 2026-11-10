import { describe, expect, it } from "vitest";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildProfilePageJsonLd,
  buildSiteJsonLd,
  buildSoftwareApplicationJsonLd,
  buildTopicArticleJsonLd,
  EMPLOYER_ORGANIZATION,
  PERSON_ID,
} from "./jsonLd";
import { SITE_UPDATED } from "@/lib/content/freshness";
import { PERSON_SUMMARY } from "@/lib/content/identity";

type Node = Record<string, unknown> & { "@type"?: string; "@id"?: string };

function graph(): Node[] {
  return (buildSiteJsonLd()["@graph"] as Node[]) ?? [];
}
function byType(t: string): Node | undefined {
  return graph().find((n) => n["@type"] === t);
}

describe("buildSiteJsonLd > emits a linked Person + WebSite + Organization graph", () => {
  it("includes a Person, a WebSite, and at least two Organizations", () => {
    expect(byType("Person")).toBeDefined();
    expect(byType("WebSite")).toBeDefined();
    expect(
      graph().filter((n) => n["@type"] === "Organization").length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("links WebSite.publisher and every founded Organization.founder to the Person @id", () => {
    const personId = byType("Person")!["@id"];
    expect((byType("WebSite")!.publisher as Node)["@id"]).toBe(personId);
    const orgs = graph().filter((n) => n["@type"] === "Organization");
    const founded = orgs.filter((o) => o.name !== EMPLOYER_ORGANIZATION.name);
    expect(founded.length).toBeGreaterThanOrEqual(2);
    for (const org of founded) {
      expect((org.founder as Node)["@id"]).toBe(personId);
    }
    for (const org of orgs) {
      expect(org.name).toBeTruthy();
      expect(String(org.url)).toMatch(/^https?:\/\//);
    }
  });

  it("lists The Binary Holdings as an employer, not as a founded company", () => {
    const tbh = graph().find(
      (n) => n["@type"] === "Organization" && n.name === "The Binary Holdings",
    );
    expect(tbh).toBeDefined();
    expect(tbh!.url).toBe("https://thebinaryholdings.com");
    expect(tbh!.founder).toBeUndefined();
    const worksFor = (byType("Person")!.worksFor as Node[]).map(
      (w) => w["@id"],
    );
    expect(worksFor).toContain(tbh!["@id"]);
  });

  it("Person.worksFor references exactly the Organization @ids (ventures + employer)", () => {
    const person = byType("Person")!;
    const orgIds = graph()
      .filter((n) => n["@type"] === "Organization")
      .map((o) => o["@id"])
      .sort();
    const worksFor = (person.worksFor as Node[]).map((w) => w["@id"]).sort();
    expect(worksFor).toEqual(orgIds);
    expect(person.sameAs as string[]).toContain(siteSocialsX);
  });

  it("Person leads with the AI role and supports name + category discovery", () => {
    const person = byType("Person")!;
    expect(person.name).toBe("Kunanon Jarat");
    expect(person.description).toBe(PERSON_SUMMARY);
    expect((person.jobTitle as string[])[0]).toBe("AI Engineering Lead");
    const aliases = person.alternateName as string[];
    expect(aliases).toEqual(
      expect.arrayContaining(["KunanonJ", "Fronk", "Fronk Kunanon Jarat"]),
    );
    expect(person.knowsAbout as string[]).toEqual(
      expect.arrayContaining(["AI engineering", "AI agents", "Fintech"]),
    );
    expect(person.alumniOf).toMatchObject({ name: "Kasetsart University" });
    expect(person.memberOf).toMatchObject({
      name: "Bangkok Startup Association",
    });
    expect(person.sameAs as string[]).not.toContain("https://gogocash.co");
  });
});

const siteSocialsX = "https://x.com/fkj98";

describe("buildProfilePageJsonLd > is a ProfilePage bound to the Person", () => {
  it("declares ProfilePage with mainEntity → Person and lives at /about", () => {
    const pp = buildProfilePageJsonLd();
    expect(pp["@type"]).toBe("ProfilePage");
    expect((pp.mainEntity as Node)["@id"]).toBe(PERSON_ID);
    expect(String(pp.url)).toContain("/about");
  });
});

describe("buildFaqJsonLd > emits a FAQPage from supplied Q&A", () => {
  it("maps each item to a Question whose acceptedAnswer carries the answer text", () => {
    const faq = buildFaqJsonLd([
      {
        question: "Who is Fronk?",
        answer: "Kunanon Jarat, a Bangkok founder.",
      },
      {
        question: "What is GoGoCash?",
        answer: "A shopping-to-earn cashback platform.",
      },
    ]);
    expect(faq["@type"]).toBe("FAQPage");
    const entities = faq.mainEntity as Node[];
    expect(entities).toHaveLength(2);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[0].name).toBe("Who is Fronk?");
    expect((entities[0].acceptedAnswer as Node).text).toBe(
      "Kunanon Jarat, a Bangkok founder.",
    );
  });
});

describe("buildArticleJsonLd > emits BlogPosting for a post", () => {
  it("links author to Person and uses the /blog slug URL", () => {
    const article = buildArticleJsonLd({
      title: "Shipping from Bangkok",
      description: "Notes on pace and craft.",
      slug: "shipping-from-bangkok",
      publishedAt: "2026-06-12",
      imageUrl: "https://example.com/banner.jpg",
      tags: ["Founding"],
    });
    expect(article["@type"]).toBe("BlogPosting");
    expect(String(article.url)).toContain("/blog/shipping-from-bangkok");
    expect((article.author as Node)["@id"]).toBe(PERSON_ID);
    expect(article.headline).toBe("Shipping from Bangkok");
  });
});

describe("buildTopicArticleJsonLd > dated, authored topic hub", () => {
  const article = buildTopicArticleJsonLd({
    path: "/th/topics/erp-crm-internal-systems",
    headline: "ERP/CRM",
    description: "Internal systems.",
    inLanguage: "th",
    datePublished: "2026-07-19",
    image: "/topics/erp-crm-internal-systems/opengraph-image",
  });

  it("names the Person as author and publisher", () => {
    expect(article["@type"]).toBe("Article");
    expect((article.author as Node)["@id"]).toBe(PERSON_ID);
    expect((article.publisher as Node)["@id"]).toBe(PERSON_ID);
  });

  it("dates the page with the site's content date as dateModified", () => {
    expect(article.datePublished).toBe("2026-07-19");
    expect(article.dateModified).toBe(SITE_UPDATED);
  });

  it("uses absolute URLs for the page and the image", () => {
    expect(String(article.url)).toMatch(
      /^https?:\/\/[^/]+\/th\/topics\/erp-crm-internal-systems$/,
    );
    expect(article["@id"]).toBe(`${String(article.url)}/#article`);
    expect((article.image as string[])[0]).toMatch(
      /^https?:\/\/[^/]+\/topics\/erp-crm-internal-systems\/opengraph-image$/,
    );
    expect(article.inLanguage).toBe("th");
  });
});

describe("buildSoftwareApplicationJsonLd > product hub entity", () => {
  it("binds author to Person and uses the case-page path", () => {
    const app = buildSoftwareApplicationJsonLd({
      name: "Manut AI",
      description: "ERP/CRM with Intelligence AI for automotive SMEs.",
      url: "https://manut.xyz",
      pagePath: "/ventures/manut",
    });
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(String(app["@id"])).toContain("/ventures/manut");
    expect((app.author as Node)["@id"]).toBe(PERSON_ID);
  });

  it("adds an Offer only when one is stated", () => {
    const base = {
      name: "Manut AI",
      description: "ERP/CRM.",
      url: "https://manut.xyz",
      pagePath: "/ventures/manut",
    };
    expect(buildSoftwareApplicationJsonLd(base).offers).toBeUndefined();
    const offers = buildSoftwareApplicationJsonLd({
      ...base,
      offer: { label: "Free to start", price: "0", priceCurrency: "THB" },
    }).offers as Node;
    expect(offers).toMatchObject({
      "@type": "Offer",
      price: "0",
      priceCurrency: "THB",
      description: "Free to start",
    });
  });
});

describe("buildBreadcrumbJsonLd > ordered trail", () => {
  it("numbers items from home through the hub", () => {
    const crumbs = buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Topics", path: "/topics/ai-transformation-thailand" },
    ]);
    expect(crumbs["@type"]).toBe("BreadcrumbList");
    const items = crumbs.itemListElement as Node[];
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[1].name).toBe("Topics");
  });
});
