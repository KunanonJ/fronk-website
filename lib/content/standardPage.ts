import type { StandardPageContent } from "@/lib/sanity/types";
import { pickOptionalString, pickString } from "@/lib/utils/pickString";

export type StandardPageSlug = "about" | "now" | "contact" | "ventures";

interface StandardPageDefaults {
  title: string;
  eyebrow: string;
  heading: string;
  description: string;
  metadataDescription?: string;
}

const DEFAULTS: Record<StandardPageSlug, StandardPageDefaults> = {
  about: {
    title: "About",
    eyebrow: "About",
    heading: "Founder, builder, operator.",
    description:
      "Kunanon Jarat (Fronk) — founder of GoGoCash, IT Manager at The Binary Holdings. Building fintech and adjacent infrastructure from Bangkok.",
  },
  now: {
    title: "Now",
    eyebrow: "Now",
    heading: "What I'm working on.",
    description:
      "What Fronk Kunanon Jarat is working on right now — building GoGoCash, running IT at The Binary Holdings, and what's currently on the desk in Bangkok.",
  },
  contact: {
    title: "Contact",
    eyebrow: "Contact",
    heading: "Say hello.",
    description:
      "Get in touch with Fronk Kunanon Jarat — email and social links.",
  },
  ventures: {
    title: "Ventures",
    eyebrow: "Ventures",
    heading: "What I'm building.",
    description:
      "Two active ventures, both grounded in Bangkok. One is a fintech, the other is an AI knowledge workspace. The links go straight to the products.",
    metadataDescription:
      "Companies and products I've founded or co-founded. The wins, the shutdowns, and what each one taught me.",
  },
};

export interface ResolvedStandardPage {
  title: string;
  eyebrow: string;
  heading: string;
  description: string;
  lastUpdated: string | null;
  metadata: {
    title: string;
    description: string;
  };
}

export function resolveStandardPage(
  slug: StandardPageSlug,
  cms: StandardPageContent | null,
): ResolvedStandardPage {
  const defaults = DEFAULTS[slug];

  return {
    title: pickString(cms?.title, defaults.title),
    eyebrow: pickString(cms?.eyebrow, defaults.eyebrow),
    heading: pickString(cms?.heading, defaults.heading),
    description: pickString(cms?.description, defaults.description),
    lastUpdated: cms?.lastUpdated?.trim() ? cms.lastUpdated.trim() : null,
    metadata: {
      title: pickString(
        cms?.seo?.title,
        pickString(cms?.title, defaults.title),
      ),
      description:
        pickOptionalString(cms?.seo?.description) ??
        pickOptionalString(cms?.description) ??
        defaults.metadataDescription ??
        defaults.description,
    },
  };
}

export function getStandardPageDefaults(slug: StandardPageSlug) {
  return DEFAULTS[slug];
}
