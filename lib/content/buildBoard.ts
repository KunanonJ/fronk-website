export type BuildColumn = "next" | "inProgress" | "shipped";

export type BuildCard = {
  id: string;
  title: string;
  body: string;
  venture?: "gogocash" | "manut" | "site";
};

export const buildPage = {
  eyebrow: "Build",
  title: "Build",
  description:
    "A thin public board of what’s next, in flight, and recently shipped — not roadmap theater.",
} as const;

export const buildColumns: readonly {
  id: BuildColumn;
  label: string;
}[] = [
  { id: "next", label: "Next" },
  { id: "inProgress", label: "In progress" },
  { id: "shipped", label: "Shipped" },
] as const;

/** Cap: ~3 next / 2 in progress / 6 shipped. Owner-editable. */
export const buildBoard: Record<BuildColumn, readonly BuildCard[]> = {
  next: [
    {
      id: "KJ-31",
      title: "Learn hub polish",
      body: "Keep /learn as the human entry to topic hubs and writing without SEO regressions.",
      venture: "site",
    },
    {
      id: "KJ-32",
      title: "Manut vertical proof",
      body: "Ship one clearer automotive SME workflow story on the Manut case page.",
      venture: "manut",
    },
    {
      id: "KJ-33",
      title: "GoGoCash merchant loop",
      body: "Tighten the browse → shop → cashback path for the next merchant cohort.",
      venture: "gogocash",
    },
  ],
  inProgress: [
    {
      id: "KJ-28",
      title: "SEA discovery hubs",
      body: "Topic hubs for AI transformation, ERP/CRM, and tech startups stay indexed and linked.",
      venture: "site",
    },
    {
      id: "KJ-29",
      title: "Landing chrome",
      body: "Floating pill nav, Activity heatmap, and keyword tips on the public shell.",
      venture: "site",
    },
  ],
  shipped: [
    {
      id: "KJ-21",
      title: "Prisma-style landing cutover",
      body: "Home + showcase cinematic shell with KunanonJ brand tokens.",
      venture: "site",
    },
    {
      id: "KJ-22",
      title: "Venture case hubs",
      body: "Public /ventures/manut and /ventures/gogocash case pages.",
      venture: "site",
    },
    {
      id: "KJ-23",
      title: "Press + blog surfaces",
      body: "Press grid and searchable blog index with Sanity fallbacks.",
      venture: "site",
    },
    {
      id: "KJ-24",
      title: "About Activity heatmap",
      body: "GitHub contribution year on /about from real public data.",
      venture: "site",
    },
    {
      id: "KJ-25",
      title: "GoGoCash live cashback",
      body: "1,000+ users and 220+ merchants on the shopping-to-earn loop.",
      venture: "gogocash",
    },
    {
      id: "KJ-26",
      title: "Manut ERP/CRM workspace",
      body: "Intelligence AI workspace for automotive SMEs at manut.xyz.",
      venture: "manut",
    },
  ],
};
