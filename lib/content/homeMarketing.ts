import type { CtaLink } from "@/lib/sanity/types";

/** Shared home marketing copy — Fronk voice, not FogLAMP SaaS metaphors. */
export const HOME_MARKETING = {
  previewLabel: "Ventures",
} as const;

export interface NarrativeBeat {
  label: string;
  text: string;
  alert?: boolean;
}

export const NARRATIVE = {
  beats: [
    {
      label: "Shoppers",
      text: "Want cash back that actually pays.",
    },
    {
      label: "Founders",
      text: "Drown in twelve tools.",
    },
    {
      label: "So I build",
      text: "The layer that holds.",
      alert: true,
    },
  ] as const satisfies readonly NarrativeBeat[],
  closing:
    "That's the work — GoGoCash for shoppers, Manut AI for solo founders, and the ops underneath at Binary Holdings.",
} as const;

export const ENGAGE_STEPS = {
  heading: "How we start.",
  subcopy: "Email the constraint. We ship the thinnest useful thing.",
  steps: [
    {
      n: "1",
      title: "Share the problem",
      body: "What broke, who it hurts, and what done looks like.",
    },
    {
      n: "2",
      title: "Pick a thin slice",
      body: "A shippable cut — not a forty-page roadmap.",
    },
    {
      n: "3",
      title: "Review live",
      body: "Look at the result, decide the next cut.",
    },
  ],
} as const;

export const ATMOSPHERIC_CTA = {
  title: "Building from Bangkok.",
  description:
    "Fintech, AI workspaces, and the systems underneath. If you're a founder with a real constraint, say hello.",
  primary: { label: "Contact", href: "/contact" } satisfies CtaLink,
  secondary: { label: "About", href: "/about" } satisfies CtaLink,
} as const;

export const FOOTER_COPY = {
  title: "Building from Bangkok.",
  line: "GoGoCash · Manut AI · Binary Holdings.",
  ctaLabel: "Contact",
  ctaHref: "/contact",
} as const;
