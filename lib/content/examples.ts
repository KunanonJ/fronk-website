export type ExamplePersona = "Builders" | "Operators" | "Founders";

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
} as const;

export const EXAMPLE_PERSONAS: readonly ExamplePersona[] = [
  "Builders",
  "Operators",
  "Founders",
] as const;

export const examplesByPersona: Record<
  ExamplePersona,
  readonly ExampleCard[]
> = {
  Builders: [
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
  Operators: [
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
      title: "Creative moments without derailing ops",
      body: "Showcase holds richer motion; the home shell stays restrained so operators can still scan.",
      href: "/showcase",
      ctaLabel: "Open showcase",
    },
  ],
  Founders: [
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
