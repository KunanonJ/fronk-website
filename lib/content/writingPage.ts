import type { WritingPageContent } from "@/lib/sanity/types";

export const DEFAULT_WRITING_PAGE = {
  eyebrow: "Blog",
  heading: "Blog",
  description:
    "Notes on fintech, AI workspaces, and shipping from Bangkok. Search or filter by tag.",
  metadata: {
    title: "Blog",
    description:
      "Writing and notes from KunanonJ — fintech, AI, and building from Bangkok.",
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
