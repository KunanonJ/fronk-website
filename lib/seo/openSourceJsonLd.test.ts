import { describe, expect, it } from "vitest";
import {
  OPEN_SOURCE_PROJECTS,
  OPEN_SOURCE_SYNCED_ON,
} from "@/lib/content/openSource";
import { PERSON_ID, WEBSITE_ID } from "@/lib/seo/jsonLd";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { SITE_ORIGIN } from "@/lib/site";
import { buildOpenSourceJsonLd } from "./openSourceJsonLd";

type Item = Record<string, unknown> & { author: { "@id": string } };
type ListItem = { position: number; item: Item };

describe("open-source JSON-LD", () => {
  const ld = buildOpenSourceJsonLd(OPEN_SOURCE_PROJECTS, OPEN_SOURCE_SYNCED_ON);
  const list = ld.mainEntity as {
    numberOfItems: number;
    itemListElement: ListItem[];
  };

  it("is the page's CollectionPage, about the site's Person", () => {
    expect(ld["@type"]).toBe("CollectionPage");
    expect(ld["@id"]).toBe(`${SITE_ORIGIN}/open-source/#collection`);
    expect(ld.url).toBe(`${SITE_ORIGIN}/open-source`);
    expect(ld.about).toEqual({ "@id": PERSON_ID });
    expect(ld.isPartOf).toEqual({ "@id": WEBSITE_ID });
    expect(ld.dateModified).toBe(OPEN_SOURCE_SYNCED_ON);
  });

  it("lists every project in the page's order", () => {
    expect(list.numberOfItems).toBe(OPEN_SOURCE_PROJECTS.length);
    expect(list.numberOfItems).toBe(3);
    expect(list.itemListElement.map((e) => e.position)).toEqual([1, 2, 3]);
  });

  it("gives each project its repository, license, release and author", () => {
    list.itemListElement.forEach(({ item }, index) => {
      const project = OPEN_SOURCE_PROJECTS[index]!;
      expect(item["@type"]).toBe("SoftwareSourceCode");
      expect(item.name).toBe(project.name);
      expect(item.url).toBe(`${SITE_ORIGIN}/open-source#${project.slug}`);
      expect(item.codeRepository).toBe(project.facts.url);
      expect(item.license).toBe("https://spdx.org/licenses/MIT.html");
      expect(item.author).toEqual({ "@id": PERSON_ID });
      expect(item.version).toBe(project.facts.release?.tag);
      expect(item.dateModified).toBe(project.facts.lastCommitAt.slice(0, 10));
    });
  });

  it("carries no counts that move between syncs", () => {
    expect(JSON.stringify(ld)).not.toMatch(/star|fork/i);
  });

  it("serialises safely inside a script tag", () => {
    const out = serializeJsonLd(ld);
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual(ld);
  });
});
