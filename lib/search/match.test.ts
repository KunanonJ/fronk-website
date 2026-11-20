import { describe, expect, it } from "vitest";
import {
  SEARCH_GROUPS,
  groupResults,
  searchEntries,
  type SearchEntry,
} from "@/lib/search/match";

/*
 * Search (premium interactions, item 8): every word must appear, titles
 * weigh most, accents fold away, Thai keeps its marks, and results come in
 * the dialog's groups.
 */
const ENTRIES: SearchEntry[] = [
  { path: "/", title: "Home", kind: "page", summary: "AI engineering lead." },
  {
    path: "/resume",
    title: "Résumé",
    kind: "page",
    summary: "Career timeline.",
  },
  {
    path: "/portfolio/tbh-intranet",
    title: "TBH Intranet",
    kind: "case",
    summary: "One back office for a multi-entity group.",
    meta: "Internal platform · May to Oct 2026",
  },
  {
    path: "/topics/ai-transformation-thailand",
    title: "AI Transformation for Thailand",
    kind: "topic",
    summary: "Operator notes.",
  },
  {
    path: "/th/topics/ai-transformation-thailand",
    title: "การเปลี่ยนผ่านด้วย AI",
    kind: "topic",
    summary: "ภาษาไทย",
    lang: "th",
  },
  {
    path: "/skills/plan",
    title: "plan",
    kind: "skill",
    summary: "Use when planning an internal tool.",
  },
];

const titles = (query: string) =>
  searchEntries(ENTRIES, query).map((entry) => entry.title);

describe("searchEntries", () => {
  it("lists the pages and the case studies for an empty query", () => {
    expect(titles("  ")).toEqual(["Home", "Résumé", "TBH Intranet"]);
  });

  it("needs every word, and puts title matches first", () => {
    expect(titles("internal")).toEqual(["TBH Intranet", "plan"]);
    expect(titles("intranet internal")).toEqual(["TBH Intranet"]);
    expect(titles("ai")[0]).toBe("AI Transformation for Thailand");
    expect(titles("nothing like this")).toEqual([]);
  });

  it("folds Latin accents both ways and keeps Thai whole", () => {
    expect(titles("resume")).toEqual(["Résumé"]);
    expect(titles("RÉSUMÉ")).toEqual(["Résumé"]);
    expect(titles("เปลี่ยน")).toEqual(["การเปลี่ยนผ่านด้วย AI"]);
  });

  it("reads the meta and the path too", () => {
    expect(titles("2026")).toEqual(["TBH Intranet"]);
    expect(titles("skills/plan")).toEqual(["plan"]);
  });
});

describe("groupResults", () => {
  it("keeps the dialog's group order and leaves empty groups out", () => {
    const groups = groupResults(searchEntries(ENTRIES, "ai"));
    expect(groups.map((group) => group.kind)).toEqual(["page", "topic"]);
    expect(SEARCH_GROUPS).toEqual(["page", "case", "topic", "skill"]);
  });
});
