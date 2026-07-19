/**
 * Static About page copy — owner-editable. Ported from AboutFallback + FAQ,
 * aligned with landing CI routes (`/blog`, `/contact`, `/#ventures`).
 */

import type { StackIconId } from "@/lib/content/stackIcons";

export type AboutInlineLink = {
  type: "link";
  text: string;
  href: string;
  external?: boolean;
};

export type AboutInlineText = {
  type: "text";
  text: string;
};

export type AboutInline = AboutInlineText | AboutInlineLink;

export type AboutParagraph = {
  spans: readonly AboutInline[];
};

export type AboutPrinciple = {
  title: string;
  body: string;
};

export type AboutPathChip = {
  label: string;
  detail: string;
};

export type AboutStackItem = {
  name: string;
  detail: string;
  /** Brand icon key — see StackBrandIcon. */
  icon: StackIconId;
};

export type AboutStackGroup = {
  label: string;
  items: readonly AboutStackItem[];
};

export const aboutPage = {
  hero: {
    title: "Built for the curious",
    support:
      "Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.",
    manifestoLabel: "Manifesto",
    manifestoHref: "#story",
  },

  story: {
    id: "story",
    eyebrow: "Profile",
    heading: "Founder, Bangkok.",
    paragraphs: [
      {
        spans: [
          {
            type: "text",
            text: "I'm Kunanon Jarat — Fronk to most people — a Bangkok-based founder and builder. I run ",
          },
          {
            type: "link",
            text: "GoGoCash",
            href: "https://gogocash.co",
            external: true,
          },
          {
            type: "text",
            text: ", the shopping-to-earn cashback platform I founded in 2023; build ",
          },
          {
            type: "link",
            text: "Manut AI",
            href: "https://manut.xyz",
            external: true,
          },
          {
            type: "text",
            text: ", an all-in-one AI workspace for solo entrepreneurs; and own IT operations at ",
          },
          {
            type: "link",
            text: "The Binary Holdings",
            href: "https://thebinaryholdings.com",
            external: true,
          },
          { type: "text", text: "." },
        ],
      },
      {
        spans: [
          {
            type: "text",
            text: "My background is technical — I trained as an electrical engineer at Kasetsart University and started my career writing smart contracts at Bitkub and architecting blockchain systems at FICO. From there I spent several years inside the room where fintech, Web3, and AI products actually get built — as a project manager at ",
          },
          {
            type: "link",
            text: "Coins.co.th",
            href: "https://x.com/coinscoth",
            external: true,
          },
          { type: "text", text: ", " },
          {
            type: "link",
            text: "Playbux",
            href: "https://x.com/playbuxco",
            external: true,
          },
          { type: "text", text: ", and " },
          {
            type: "link",
            text: "Aiden Labs",
            href: "https://x.com/Aiden_Labs",
            external: true,
          },
          {
            type: "text",
            text: ", where I ran ICO process design and tokenomics alongside the engineering roadmap.",
          },
        ],
      },
      {
        spans: [
          {
            type: "text",
            text: "Founding GoGoCash was the natural next step. I learned that the interesting problems weren't ever the algorithms — they were the messy, organisational ones. The work that makes a small team feel like a much larger one.",
          },
        ],
      },
    ] satisfies readonly AboutParagraph[],
  },

  principles: {
    id: "principles",
    eyebrow: "How I work",
    heading: "Four operating principles.",
    items: [
      {
        title: "Ship the smallest thing that proves the bet.",
        body: "Pre-revenue founders confuse motion with progress; the cure is shrinking the next milestone until it scares you.",
      },
      {
        title: "Stay close to the work.",
        body: "Operators who haven't touched the product in six months stop making good calls. I review code, sit in support, and ship something most weeks.",
      },
      {
        title: "Optimise for reversibility.",
        body: "Most decisions framed as one-way doors are actually two-way. Cheap to try, cheap to undo, expensive to defer — in that order.",
      },
      {
        title: "Document as you go.",
        body: "Tokenomics, project plans, incident reports — the unsexy artefacts are what make growth possible without re-explaining the same thing every week.",
      },
    ] satisfies readonly AboutPrinciple[],
  },

  now: {
    id: "now",
    eyebrow: "Now",
    heading: "What I'm doing now.",
    paragraphs: [
      {
        spans: [
          { type: "text", text: "Building " },
          {
            type: "link",
            text: "GoGoCash",
            href: "https://gogocash.co",
            external: true,
          },
          { type: "text", text: " as my main focus, with " },
          {
            type: "link",
            text: "Manut AI",
            href: "https://manut.xyz",
            external: true,
          },
          {
            type: "text",
            text: " as a parallel build. Helping the broader Binary Holdings group run smoother as IT Manager. Participating in ",
          },
          {
            type: "link",
            text: "Protocol Camp",
            href: "https://protocol.camp",
            external: true,
          },
          {
            type: "text",
            text: " cohort 2025 and the Bangkok Startup Association. Writing the occasional note in the ",
          },
          { type: "link", text: "blog", href: "/blog" },
          {
            type: "text",
            text: " when something is worth working out in public.",
          },
        ],
      },
      {
        spans: [
          {
            type: "text",
            text: "If you're a founder, builder, or operator with an interesting problem in fintech, AI, or Web3 — especially in Southeast Asia — ",
          },
          { type: "link", text: "say hello", href: "/contact" },
          { type: "text", text: ". I read everything." },
        ],
      },
    ] satisfies readonly AboutParagraph[],
  },

  /**
   * Tech stack grounded in public GitHub (@KunanonJ + @mygogocash).
   * Prefer languages/frameworks evidenced in active repos — not a wishlist.
   */
  stack: {
    id: "stack",
    eyebrow: "Tech stack",
    heading: "What shows up in the repos.",
    lede: "Read from public GitHub — personal (@KunanonJ) and GoGoCash (@mygogocash). TypeScript is the through-line; Solidity and Python still appear where the problem needs them.",
    groups: [
      {
        label: "Core",
        items: [
          {
            name: "TypeScript",
            detail: "Primary language across site, GoGoCash, Manut",
            icon: "typescript",
          },
          {
            name: "React / Next.js",
            detail: "Web apps, admin, marketing, kunanonj.com",
            icon: "nextdotjs",
          },
          {
            name: "Expo / React Native",
            detail: "Mobile + web from one codebase (GoGoCash, Manut)",
            icon: "expo",
          },
          {
            name: "Tailwind CSS",
            detail: "UI styling on product and personal surfaces",
            icon: "tailwindcss",
          },
        ],
      },
      {
        label: "GoGoCash",
        items: [
          {
            name: "Turborepo",
            detail: "Monorepo for API, admin, and customer app",
            icon: "turborepo",
          },
          {
            name: "NestJS",
            detail: "API services on Google Cloud Run",
            icon: "nestjs",
          },
          {
            name: "MongoDB",
            detail: "Primary product data store",
            icon: "mongodb",
          },
          {
            name: "Firebase",
            detail: "Hosting, Firestore, analytics on public surfaces",
            icon: "firebase",
          },
          {
            name: "Playwright",
            detail: "E2E coverage on landing and product flows",
            icon: "playwright",
          },
          {
            name: "Solidity / ERC-20",
            detail: "GGC token (OpenZeppelin) — Web3 lineage",
            icon: "solidity",
          },
        ],
      },
      {
        label: "Manut",
        items: [
          {
            name: "Cloudflare Workers",
            detail: "Fail-closed edge runtime + Durable Objects",
            icon: "cloudflare",
          },
          {
            name: "Hono",
            detail: "Edge API layer",
            icon: "hono",
          },
          {
            name: "Postgres + Prisma",
            detail: "Hyperdrive-backed relational ops data",
            icon: "prisma",
          },
          {
            name: "R2 + Queues",
            detail: "Object storage and async work on the edge",
            icon: "cloudflare",
          },
        ],
      },
      {
        label: "Personal & agents",
        items: [
          {
            name: "OpenNext / Cloudflare",
            detail: "kunanonj.com on Workers",
            icon: "cloudflare",
          },
          {
            name: "Sanity",
            detail: "Studio, resume, and editorial content",
            icon: "sanity",
          },
          {
            name: "Cursor / Claude Code",
            detail: "AI coding agents (skills hub + daily build)",
            icon: "cursor",
          },
          {
            name: "Local-first finance tools",
            detail: "OpenFinance, tres-finos experiments",
            icon: "finance",
          },
        ],
      },
    ] satisfies readonly AboutStackGroup[],
    moreHref: "/stack",
    moreLabel: "Full stack page",
  },

  path: {
    id: "path",
    eyebrow: "Selected path",
    heading: "A short arc.",
    chips: [
      { label: "Kasetsart", detail: "Electrical Engineering" },
      { label: "Bitkub", detail: "Smart contracts" },
      { label: "FICO", detail: "Blockchain systems" },
      { label: "Coins / Playbux", detail: "Fintech PM" },
      { label: "Aiden Labs", detail: "AI + tokenomics" },
      { label: "GoGoCash", detail: "Founder · 2023—" },
    ] satisfies readonly AboutPathChip[],
    resumeHref: "/resume",
    resumeLabel: "Full resume",
  },

  faq: {
    id: "faq",
    eyebrow: "FAQ",
    heading: "Quick answers.",
  },

  cta: {
    eyebrow: "Next",
    heading: "Let's talk.",
    body: "Founders, builders, and operators working on fintech, AI, or Web3 in Southeast Asia — reach out.",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Ventures", href: "/#ventures" },
      { label: "Resume", href: "/resume" },
    ],
  },
} as const;
