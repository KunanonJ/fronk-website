import type { StackGroupId } from "@/lib/library/search";
import { PAGE_META } from "@/lib/content/pageMeta";

export type StackItem = {
  name: string;
  purpose: string;
  website: string;
  group: StackGroupId;
  /** Two-letter mono badge (bento canvas); stands in for a brand logo. */
  badge: string;
};

export const stackPage = {
  eyebrow: "Stack",
  title: "Stack",
  description: PAGE_META.stack.description,
  /** The description as the bento canvas draws the h1: one entry per line. */
  headline: {
    lines: [
      [{ muted: "Tools evidenced in" }, " public GitHub,"],
      [{ muted: "not a wishlist." }],
    ],
    accent: "TypeScript is the through-line.",
  },
  /** The tool the Through-line card leads with. */
  throughLine: "TypeScript",
  /** The public GitHub accounts the stack is evidenced in. */
  orgs: [
    { label: "github.com/KunanonJ", href: "https://github.com/KunanonJ" },
    { label: "github.com/mygogocash", href: "https://github.com/mygogocash" },
  ],
} as const;

/** The groups in filter order. */
export const STACK_GROUPS: readonly { id: StackGroupId; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "ship", label: "Ship" },
  { id: "operate", label: "Operate" },
] as const;

/** Grounded in public repos on github.com/KunanonJ and github.com/mygogocash. */
export const stackItems: readonly StackItem[] = [
  {
    name: "TypeScript",
    purpose: "Primary language across kunanonj.com, GoGoCash, and Manut",
    website: "https://www.typescriptlang.org",
    group: "build",
    badge: "TS",
  },
  {
    name: "Next.js",
    purpose: "Web apps, admin dashboards, marketing sites",
    website: "https://nextjs.org",
    group: "build",
    badge: "NJ",
  },
  {
    name: "Expo / React Native",
    purpose: "Customer and ops apps for web, iOS, and Android",
    website: "https://expo.dev",
    group: "build",
    badge: "ER",
  },
  {
    name: "Turborepo",
    purpose: "Monorepos for GoGoCash and Manut product surfaces",
    website: "https://turbo.build",
    group: "build",
    badge: "TR",
  },
  {
    name: "NestJS",
    purpose: "GoGoCash API services (Cloud Run)",
    website: "https://nestjs.com",
    group: "ship",
    badge: "NS",
  },
  {
    name: "MongoDB",
    purpose: "GoGoCash product data store",
    website: "https://www.mongodb.com",
    group: "ship",
    badge: "MD",
  },
  {
    name: "Firebase",
    purpose: "Hosting, Firestore, and analytics on GoGoCash public surfaces",
    website: "https://firebase.google.com",
    group: "ship",
    badge: "FB",
  },
  {
    name: "Google Cloud Run",
    purpose: "Deploy NestJS / Strapi services for GoGoCash",
    website: "https://cloud.google.com/run",
    group: "ship",
    badge: "GC",
  },
  {
    name: "Cloudflare Workers",
    purpose: "Manut edge runtime + kunanonj.com (TanStack Start)",
    website: "https://workers.cloudflare.com",
    group: "ship",
    badge: "CW",
  },
  {
    name: "Postgres + Prisma",
    purpose: "Manut relational ops data via Hyperdrive",
    website: "https://www.prisma.io",
    group: "ship",
    badge: "PP",
  },
  {
    name: "Hono",
    purpose: "Manut edge API layer on Workers",
    website: "https://hono.dev",
    group: "ship",
    badge: "HO",
  },
  {
    name: "Solidity",
    purpose: "GGC ERC-20 and earlier smart-contract / audit work",
    website: "https://soliditylang.org",
    group: "ship",
    badge: "SO",
  },
  {
    name: "Sanity",
    purpose: "CMS for studio, resume, and editorial on kunanonj.com",
    website: "https://www.sanity.io",
    group: "operate",
    badge: "SA",
  },
  {
    name: "Playwright",
    purpose: "E2E coverage on GoGoCash landing and product flows",
    website: "https://playwright.dev",
    group: "operate",
    badge: "PW",
  },
  {
    name: "GitHub",
    purpose: "Source of truth — KunanonJ + mygogocash orgs",
    website: "https://github.com/KunanonJ",
    group: "operate",
    badge: "GH",
  },
  {
    name: "Cursor / Claude Code",
    purpose: "AI coding agents used daily (skills hub + product work)",
    website: "https://cursor.com",
    group: "operate",
    badge: "CC",
  },
] as const;

export function stackItemsByGroup(group: StackGroupId): readonly StackItem[] {
  return stackItems.filter((item) => item.group === group);
}
