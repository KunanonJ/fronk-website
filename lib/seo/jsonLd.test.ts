import { describe, expect, it } from "vitest";
import {
  buildArticleJsonLd,
  buildFaqJsonLd,
  buildProfilePageJsonLd,
  buildSiteJsonLd,
  PERSON_ID,
} from "./jsonLd";

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
    expect(graph().filter((n) => n["@type"] === "Organization").length).toBeGreaterThanOrEqual(2);
  });

  it("links WebSite.publisher and every Organization.founder to the Person @id", () => {
    const personId = byType("Person")!["@id"];
    expect((byType("WebSite")!.publisher as Node)["@id"]).toBe(personId);
    for (const org of graph().filter((n) => n["@type"] === "Organization")) {
      expect((org.founder as Node)["@id"]).toBe(personId);
      expect(org.name).toBeTruthy();
      expect(String(org.url)).toMatch(/^https?:\/\//);
    }
  });

  it("Person.worksFor references exactly the Organization @ids (honest, real ventures)", () => {
    const person = byType("Person")!;
    const orgIds = graph()
      .filter((n) => n["@type"] === "Organization")
      .map((o) => o["@id"])
      .sort();
    const worksFor = (person.worksFor as Node[]).map((w) => w["@id"]).sort();
    expect(worksFor).toEqual(orgIds);
    expect(person.sameAs as string[]).toContain(siteSocialsX);
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
      { question: "Who is Fronk?", answer: "Kunanon Jarat, a Bangkok founder." },
      { question: "What is GoGoCash?", answer: "A shopping-to-earn cashback platform." },
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
