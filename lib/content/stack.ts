import type { StackIconId } from "@/lib/content/stackIcons";

export type StackGroup = "Build" | "Ship" | "Operate";

export type StackItem = {
  name: string;
  purpose: string;
  website: string;
  group: StackGroup;
  icon: StackIconId;
};

export const stackPage = {
  eyebrow: "Stack",
  title: "Stack",
  description:
    "Tools evidenced in public GitHub — @KunanonJ and @mygogocash — not a wishlist. TypeScript is the through-line.",
} as const;

export const STACK_GROUPS: readonly StackGroup[] = [
  "Build",
  "Ship",
  "Operate",
] as const;

/** Grounded in public repos on github.com/KunanonJ and github.com/mygogocash. */
export const stackItems: readonly StackItem[] = [
  {
    name: "TypeScript",
    purpose: "Primary language across kunanonj.com, GoGoCash, and Manut",
    website: "https://www.typescriptlang.org",
    group: "Build",
    icon: "typescript",
  },
  {
    name: "Next.js",
    purpose: "Web apps, admin dashboards, marketing sites, personal site",
    website: "https://nextjs.org",
    group: "Build",
    icon: "nextdotjs",
  },
  {
    name: "Expo / React Native",
    purpose: "Customer and ops apps for web, iOS, and Android",
    website: "https://expo.dev",
    group: "Build",
    icon: "expo",
  },
  {
    name: "Turborepo",
    purpose: "Monorepos for GoGoCash and Manut product surfaces",
    website: "https://turbo.build",
    group: "Build",
    icon: "turborepo",
  },
  {
    name: "NestJS",
    purpose: "GoGoCash API services (Cloud Run)",
    website: "https://nestjs.com",
    group: "Ship",
    icon: "nestjs",
  },
  {
    name: "MongoDB",
    purpose: "GoGoCash product data store",
    website: "https://www.mongodb.com",
    group: "Ship",
    icon: "mongodb",
  },
  {
    name: "Firebase",
    purpose: "Hosting, Firestore, and analytics on GoGoCash public surfaces",
    website: "https://firebase.google.com",
    group: "Ship",
    icon: "firebase",
  },
  {
    name: "Google Cloud Run",
    purpose: "Deploy NestJS / Strapi services for GoGoCash",
    website: "https://cloud.google.com/run",
    group: "Ship",
    icon: "googlecloud",
  },
  {
    name: "Cloudflare Workers",
    purpose: "Manut edge runtime + kunanonj.com (OpenNext)",
    website: "https://workers.cloudflare.com",
    group: "Ship",
    icon: "cloudflare",
  },
  {
    name: "Postgres + Prisma",
    purpose: "Manut relational ops data via Hyperdrive",
    website: "https://www.prisma.io",
    group: "Ship",
    icon: "prisma",
  },
  {
    name: "Hono",
    purpose: "Manut edge API layer on Workers",
    website: "https://hono.dev",
    group: "Ship",
    icon: "hono",
  },
  {
    name: "Solidity",
    purpose: "GGC ERC-20 and earlier smart-contract / audit work",
    website: "https://soliditylang.org",
    group: "Ship",
    icon: "solidity",
  },
  {
    name: "Sanity",
    purpose: "CMS for studio, resume, and editorial on kunanonj.com",
    website: "https://www.sanity.io",
    group: "Operate",
    icon: "sanity",
  },
  {
    name: "Playwright",
    purpose: "E2E coverage on GoGoCash landing and product flows",
    website: "https://playwright.dev",
    group: "Operate",
    icon: "playwright",
  },
  {
    name: "GitHub",
    purpose: "Source of truth — KunanonJ + mygogocash orgs",
    website: "https://github.com/KunanonJ",
    group: "Operate",
    icon: "github",
  },
  {
    name: "Cursor / Claude Code",
    purpose: "AI coding agents used daily (skills hub + product work)",
    website: "https://cursor.com",
    group: "Operate",
    icon: "cursor",
  },
] as const;

export function stackItemsByGroup(
  group: StackGroup,
): readonly StackItem[] {
  return stackItems.filter((item) => item.group === group);
}
