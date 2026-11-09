import type { ExamplePersonaId } from "@/lib/library/search";

export type ExampleCard = {
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
};

export const examplesPage = {
  eyebrow: "Examples",
  title: "Examples",
  description:
    "What changes when the work is operator-first — ventures, systems, and a few creative moments from Bangkok.",
  /** The description as the bento canvas splits it: the h1, then the lead. */
  headline: {
    lines: [[{ muted: "What changes when" }], ["the work is"]],
    accent: "operator-first.",
  },
  lede: "Ventures, systems, and a few creative moments from Bangkok.",
} as const;

/** The personas in picker order; the first is the default. */
export const EXAMPLE_PERSONAS: readonly {
  id: ExamplePersonaId;
  label: string;
}[] = [
  { id: "builders", label: "Builders" },
  { id: "operators", label: "Operators" },
  { id: "founders", label: "Founders" },
] as const;

export const examplesByPersona: Record<
  ExamplePersonaId,
  readonly ExampleCard[]
> = {
  builders: [
    {
      title: "Ship the cashback loop end to end",
      body: "GoGoCash keeps browse → shop → earn in one product surface instead of stitching affiliate tabs forever.",
      href: "/ventures/gogocash",
      ctaLabel: "GoGoCash case",
    },
    {
      title: "Scaffold the system of record first",
      body: "Manut starts from ERP/CRM for automotive SMEs, then layers Intelligence AI where judgment repeats.",
      href: "/ventures/manut",
      ctaLabel: "Manut case",
    },
    {
      title: "Reuse house style across agents",
      body: "Same brand tokens and thin-slice habits show up in the public site and the venture builds.",
      href: "/stack",
      ctaLabel: "See stack",
    },
  ],
  operators: [
    {
      title: "Fewer tabs, same decisions",
      body: "Internal systems beat chatbot theater — start where ops already live, then automate the repeats.",
      href: "/topics/erp-crm-internal-systems",
      ctaLabel: "ERP / CRM hub",
    },
    {
      title: "Proof over pitch decks",
      body: "Users, merchants, and case pages stay honest — no fabricated leaderboard scores.",
      href: "/proof",
      ctaLabel: "See proof",
    },
    {
      title: "Internal tools, shown honestly",
      body: "Portfolio pages describe what each internal tool does and what it runs on, with no invented clients or numbers.",
      href: "/portfolio",
      ctaLabel: "See portfolio",
    },
  ],
  founders: [
    {
      title: "Build from Bangkok into SEA",
      body: "Fintech and AI workspaces shipping from Thailand — transformation that lands in production.",
      href: "/topics/tech-startup-thailand-sea",
      ctaLabel: "Startups hub",
    },
    {
      title: "AI transformation without the slide deck",
      body: "Replace scattered tools with systems that compound — topic hub for Thai and SEA SMEs.",
      href: "/topics/ai-transformation-thailand",
      ctaLabel: "AI hub",
    },
    {
      title: "Thin public build board",
      body: "Next / in progress / shipped — a living slice, not a five-year roadmap poster.",
      href: "/build",
      ctaLabel: "Build board",
    },
  ],
};
