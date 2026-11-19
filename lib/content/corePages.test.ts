import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  aboutHeadline,
  contactHeadline,
  headlineText,
  portfolioHeadline,
} from "@/lib/content/corePages";

/*
 * The h1s of the pages the Phase 6 cutover restyled keep their text word for
 * word: the parity gate reads the first h1 with its tags stripped, and the
 * umbrella's Public Contracts keep every h1.
 */
const reference = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/site-parity.json"), "utf8"),
) as Record<string, { h1: string | null }>;

describe("core page h1s", () => {
  it.each([
    ["/portfolio", portfolioHeadline],
    ["/about", aboutHeadline],
    ["/contact", contactHeadline],
  ] as const)("%s reads as the parity reference", (path, lines) => {
    expect(headlineText(lines)).toBe(reference[path]!.h1);
  });

  it("keeps the accent on the last words only", () => {
    for (const lines of [portfolioHeadline, aboutHeadline, contactHeadline]) {
      const accents = lines.flat().filter((part) => part.tone === "accent");
      expect(accents).toHaveLength(1);
      expect(lines.at(-1)!.at(-1)).toBe(accents[0]);
    }
  });
});
