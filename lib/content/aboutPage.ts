/**
 * Static About page copy — owner-editable. Ported from AboutFallback + FAQ,
 * aligned with landing CI routes (`/blog`, `/contact`, `/#ventures`).
 */

import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import type { StackIconId } from "@/lib/content/stackIcons";
import {
  AVAILABILITY,
  LATEST_ROLE,
  PERSON_SUMMARY,
} from "@/lib/content/identity";
import { PAGE_META } from "@/lib/content/pageMeta";

type AboutInlineLink = {
  type: "link";
  text: string;
  href: string;
  external?: boolean;
};

type AboutInlineText = {
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

type AboutStackItem = {
  name: string;
  detail: string;
  /** Brand icon key (lib/content/stackIcons). */
  icon: StackIconId;
};

export type AboutStackGroup = {
  label: string;
  items: readonly AboutStackItem[];
};

export const aboutPage = {
  /**
   * Page <title> and meta description. The title is used as-is (no site
   * suffix) because it already carries the name; kept under 60 characters
   * so Google can show it whole and reuse it as a sitelink.
   */
  meta: PAGE_META.about,

  /**
   * Bento hero (phase 7b, canvas): text beside a portrait panel. The email
   * signup was removed while the blog is hidden; it never submitted anyway.
   */
  hero: {
    /**
     * The page h1 in three lines: "About Kunanon Jarat: / AI, ERP/CRM and /
     * startups in Bangkok." It restates the page title, so name queries
     * still match the heading. `muted` words render in --muted; the last
     * line takes the accent colour.
     */
    headline: {
      muted: "About",
      name: "Kunanon Jarat:",
      focus: "AI, ERP/CRM",
      joiner: "and",
      accent: "startups in Bangkok.",
    },
    nickname: "Fronk",
    location: "Bangkok, Thailand",
    // Owner direction 20-11-26: the Binary Holdings role ended.
    role: `Founder of GoGoCash and Manut AI. Previously ${LATEST_ROLE.title} at ${LATEST_ROLE.organization}.`,
    /** 480x480 WebP crop of /profile.jpg for the round frame. */
    portraitSrc: "/profile-portrait.webp",
    /**
     * The same crop at its full 800 px (800 x 800 at 217, 20 in
     * /profile.jpg, WebP quality 80 as the 480), for 2x and 3x screens,
     * where the frame draws 280 to 420 px (UX hunt 22-11-26, U26). The
     * photo holds no more than that, so no larger file.
     */
    portraitLarge: { src: "/profile-portrait-800.webp", width: 800 },
    portraitAlt: "Kunanon Jarat (Fronk), headshot",
    primaryCta: { label: "Contact me", href: "/contact" },
    secondaryCta: { label: "See my work", href: "/portfolio" },
    storyLabel: "Read my story",
    storyHref: "#story",
  },

  story: {
    id: "story",
    eyebrow: "Story",
    heading: "Founder and builder, Bangkok.", // Owner direction 20-11-26.
    /** ~50-word answer block for name queries / AEO (matches FAQ + llms.txt). */
    whoIs: PERSON_SUMMARY,
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
            text: ", the shopping-to-earn cashback platform I founded in 2023, and build ",
          },
          {
            type: "link",
            text: "Manut AI",
            href: "https://manut.xyz",
            external: true,
          },
          {
            type: "text",
            // Owner direction 20-11-26: the role ended.
            text: `, an ERP/CRM workspace with Intelligence AI for automotive SMEs. Until ${LATEST_ROLE.until} I led IT and AI engineering at `,
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
            text: "My background is technical — I trained as an electrical engineer at Kasetsart University and started my career writing smart contracts at Bitkub and building blockchain systems at KK Venture Global. From there I spent several years inside the room where fintech, Web3, and AI products actually get built — as a project manager at ",
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

  /**
   * /about sets this in the story's column, beside the records card: the
   * heading is an h3 there and carries the id (owner decision 21-11-26).
   */
  now: {
    id: "now",
    heading: "What I'm doing now.",
    paragraphs: [
      {
        spans: [
          // Owner direction 20-11-26: the ventures now, then the
          // role that ended. The footer's Now line restates the opening.
          { type: "text", text: "Building " },
          {
            type: "link",
            text: "GoGoCash",
            href: "https://gogocash.co",
            external: true,
          },
          { type: "text", text: " and " },
          {
            type: "link",
            text: "Manut AI",
            href: "https://manut.xyz",
            external: true,
          },
          {
            type: "text",
            text: ` as a solopreneur, and not looking for a full-time role right now. ${AVAILABILITY.workWith} Until ${LATEST_ROLE.until} I led AI engineering at ${LATEST_ROLE.organization} as IT Manager and AI Engineering Lead: ARIA, the intranet's assistant, and agents that keep a person in the loop. More on how I work in `,
          },
          {
            type: "link",
            text: "AI engineering",
            href: "/topics/forward-deployed-ai-engineering",
          },
          // Owner direction 21-11-26: the cohort ran Sep 2025 to Jan 2026.
          { type: "text", text: ". " },
          {
            type: "link",
            text: "Protocol Camp",
            href: "https://protocol.camp",
            external: true,
          },
          // The blog sentence returns with the blog (BLOG_PUBLIC; hidden 09-11-26).
          ...(BLOG_PUBLIC
            ? ([
                {
                  type: "text",
                  text: " cohort 2025 alum, and a member of the Bangkok Startup Association. Writing the occasional note in the ",
                },
                { type: "link", text: "blog", href: "/blog" },
                {
                  type: "text",
                  text: " when something is worth working out in public.",
                },
              ] as const)
            : ([
                {
                  type: "text",
                  text: " cohort 2025 alum, and a member of the Bangkok Startup Association.",
                },
              ] as const)),
        ],
      },
      {
        spans: [
          {
            type: "text",
            // Owner direction 20-11-26: no hiring invitation.
            text: "If you're a founder, builder, or operator with an interesting problem in fintech, AI, or Web3 — especially in Southeast Asia — or you have a project, a partnership, a talk or a workshop in mind, ",
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
            name: "TanStack Start / Cloudflare",
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
      { label: "KK Venture Global", detail: "Blockchain systems" },
      { label: "Coins / Playbux", detail: "Fintech PM" },
      { label: "Aiden Labs", detail: "AI + tokenomics" },
      { label: "GoGoCash", detail: "Founder · 2023—" },
      {
        label: "The Binary Holdings",
        detail: "AI Engineering Lead · 2025—2026",
      },
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
    // Owner direction 20-11-26: partners and projects, not roles.
    body: "Founders, operators and partners in Southeast Asia: for partnerships, freelance and consulting projects, advisory, talks or workshops, reach out.",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Agent skills", href: "/skills" },
      {
        label: "AI engineering",
        href: "/topics/forward-deployed-ai-engineering",
      },
      { label: "Resume", href: "/resume" },
    ],
  },
} as const;
