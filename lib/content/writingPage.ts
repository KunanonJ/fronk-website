import type { WritingPageContent } from "@/lib/sanity/types";

export const DEFAULT_WRITING_PAGE = {
  eyebrow: "Writing",
  heading: "Journal.",
  description:
    "Working notes on building, hiring, and shipping. Published roughly once a week.",
  metadata: {
    title: "Writing",
    description:
      "Long-form notes on starting and running companies — fundraising, hiring, product, and the daily reality of building from zero.",
  },
} as const;

export type ResolvedWritingPage = {
  eyebrow: string;
  heading: string;
  description: string;
  metadata: {
    title: string;
    description: string;
  };
};

function pickString(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function resolveWritingPageContent(
  cms: WritingPageContent | null,
): ResolvedWritingPage {
  return {
    eyebrow: pickString(cms?.eyebrow, DEFAULT_WRITING_PAGE.eyebrow),
    heading: pickString(cms?.heading, DEFAULT_WRITING_PAGE.heading),
    description: pickString(cms?.description, DEFAULT_WRITING_PAGE.description),
    metadata: {
      title: pickString(cms?.seo?.title, DEFAULT_WRITING_PAGE.metadata.title),
      description: pickString(
        cms?.seo?.description,
        DEFAULT_WRITING_PAGE.metadata.description,
      ),
    },
  };
}
