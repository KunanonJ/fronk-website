import { allCaseStudies } from "@/lib/content/caseStudy";
import { PAGE_META } from "@/lib/content/pageMeta";
import { getAllSkills } from "@/lib/content/skills";
import {
  getAllTopicPillars,
  topicPath,
  type TopicLocale,
  type TopicSlug,
} from "@/lib/content/topics/pillars";
import { RESUME_META } from "@/lib/resume/search";
import type { SearchEntry } from "@/lib/search/match";
import { siteConfig } from "@/lib/site";

/*
 * /search.json: every public page in a few words, for the search dialog
 * (⌘K) and the link previews, which fetch it on first use. Built from
 * lib/content with the pages' own titles and descriptions (no new copy), so
 * a new case, topic or skill appears without an edit. Hidden pages (the
 * blog, press) stay out.
 */

/** The public pages besides the cases, topics and skills, in nav order. */
const PAGES: readonly SearchEntry[] = [
  { path: "/", title: "Home", kind: "page", summary: siteConfig.tagline },
  {
    path: "/about",
    title: "About",
    kind: "page",
    summary: PAGE_META.about.description,
  },
  {
    path: "/portfolio",
    title: PAGE_META.portfolio.title,
    kind: "page",
    summary: PAGE_META.portfolio.description,
  },
  {
    path: RESUME_META.path,
    title: "Résumé",
    kind: "page",
    summary: RESUME_META.description,
  },
  ...(
    [
      "skills",
      "learn",
      "proof",
      "stack",
      "examples",
      "build",
      "contact",
    ] as const
  ).map((key): SearchEntry => ({
    path: `/${key}`,
    title: PAGE_META[key].title,
    kind: "page",
    summary: PAGE_META[key].description,
  })),
];

function topics(locale: TopicLocale): SearchEntry[] {
  return getAllTopicPillars(locale).map((pillar) => ({
    path: topicPath(pillar.slug as TopicSlug, locale),
    title: pillar.title,
    kind: "topic",
    summary: pillar.description,
    ...(locale === "th" ? { lang: "th" as const } : {}),
  }));
}

export function buildSearchIndex(): SearchEntry[] {
  return [
    ...PAGES,
    ...allCaseStudies().map((study): SearchEntry => ({
      path: study.path,
      title: study.name,
      kind: "case",
      summary: study.tagline,
      meta: study.eyebrow,
    })),
    ...topics("en"),
    ...topics("th"),
    ...getAllSkills().map((skill): SearchEntry => ({
      path: `/skills/${skill.slug}`,
      title: skill.name,
      kind: "skill",
      summary: skill.description,
    })),
  ];
}

export function GET(): Response {
  return new Response(JSON.stringify(buildSearchIndex()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
