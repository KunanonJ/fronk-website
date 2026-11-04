/**
 * Portfolio: internal tools, automations and AI agents built at The Binary
 * Holdings. Separate from Ventures (founder companies in `ventures.ts`).
 *
 * Honesty rule (same as ventures): every claim restates something the
 * project's own source or docs show. No invented numbers, clients or outcomes,
 * and nothing internal (hostnames, IDs, balances, staff or partner names).
 *
 * Adding screenshots:
 *   1. Drop files into `public/portfolio/<slug>/` (e.g. `cover.png`, `shot-1.png`).
 *      16:10 crops look best on cards; any size works on the detail page.
 *   2. Register them on the project below as `cover` and/or `gallery` with
 *      `src: "/portfolio/<slug>/<file>"`, a real `alt`, and pixel `width`/`height`.
 *   Until a `cover` is set, cards and detail pages show a typographic placeholder.
 *   `portfolio.test.ts` fails if a registered image file is missing.
 */

export interface PortfolioImage {
  /** Site-relative path under `/portfolio/<slug>/`. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface PortfolioProject {
  slug: string;
  name: string;
  /** One short line, ends with a period. */
  tagline: string;
  /** One or two sentences for cards, meta description and llms.txt. */
  summary: string;
  /** Short label for the eyebrow and placeholder cover. */
  category: string;
  role: string;
  organization: string;
  /** Display string, e.g. "May to Oct 2026". */
  period: string;
  year: number;
  /** Internal tools sit behind a login, so they carry no public link. */
  access: "internal" | "public";
  url?: string;
  urlLabel?: string;
  stack: readonly string[];
  highlights: readonly string[];
  sections: readonly { heading: string; body: string }[];
  cover?: PortfolioImage;
  gallery?: readonly PortfolioImage[];
}

export const portfolioPage = {
  eyebrow: "Portfolio",
  title: "Selected work",
  description:
    "Internal tools, automations and AI agents built at The Binary Holdings. They run behind a login, so each page shows what the product does and how it is built rather than a live link.",
} as const;

const PORTFOLIO_PROJECTS: readonly PortfolioProject[] = [
  {
    slug: "tbh-intranet",
    name: "TBH Intranet",
    tagline: "One back office for a multi-entity group.",
    summary:
      "An internal operations platform built to replace Zoho at The Binary Holdings, bringing HR, approvals, Thai accounting, expenses, CRMs and an AI assistant into one login-only web app.",
    category: "Internal platform",
    role: "IT Manager",
    organization: "The Binary Holdings",
    period: "May to Oct 2026",
    year: 2026,
    access: "internal",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS 4",
      "shadcn/ui",
      "Express 5",
      "Prisma",
      "PostgreSQL (Supabase)",
      "Supabase Auth",
      "Socket.IO",
      "Google Gemini",
      "Claude API",
      "Turborepo",
      "Vercel",
      "GitHub Actions",
      "Vitest",
      "Playwright",
    ],
    highlights: [
      "HR in one place: leave, payroll, attendance and benefits",
      "Approval chains for leave, travel and expense requests",
      "Thai accounting suite: general ledger, AR/AP, withholding tax, bank reconciliation and fixed assets",
      "Expenses and cash advances with Bank of Thailand exchange rates",
      "Sales, partner and investor CRMs",
      "ARIA, an AI assistant that reads attachments and searches internal knowledge",
      "Projects, surveys, internal chat and company news",
    ],
    sections: [
      {
        heading: "The problem",
        body: "The Binary Holdings ran its internal operations on Zoho. The intranet replaces it with one system built around how the group works: several legal entities, Thai accounting requirements and multi-step approvals.",
      },
      {
        heading: "How it is built",
        body: "A Turborepo monorepo with a Next.js web app and an Express API over PostgreSQL on Supabase, using Prisma for data access. Real-time features run over Socket.IO, and ARIA combines Gemini and Claude models with embedding search over internal knowledge. It deploys to Vercel, with GitHub Actions running Vitest and Playwright tests.",
      },
    ],
  },
  {
    slug: "node-validator-automation",
    name: "Node Validator Automation",
    tagline: "Daily health checks for Avalanche L1 validators.",
    summary:
      "A dependency-free Node.js job that reads validator balances from the Avalanche P-Chain every morning, works out burn rate and runway, and emails a red or green report before any validator runs dry.",
    category: "Ops automation",
    role: "IT Manager",
    organization: "The Binary Holdings",
    period: "May to Sep 2026",
    year: 2026,
    access: "internal",
    stack: [
      "Node.js",
      "JavaScript",
      "Avalanche P-Chain RPC",
      "Resend",
      "GitHub Actions",
    ],
    highlights: [
      "Pulls the current validator set live from the P-Chain over JSON-RPC",
      "Works out daily burn rate and remaining runway from day-over-day balances",
      "Four alert rules: low balance, runway under a week, inactive validator and a sharp one-day drop",
      "HTML, plain-text and JSON reports with a red or green status header",
      "Email delivery through Resend, with exit codes that hand off to a fallback when sending fails",
      "Runs on a daily GitHub Actions schedule and commits each run's data as an audit trail",
    ],
    sections: [
      {
        heading: "The problem",
        body: "Validators on an Avalanche L1 pay a continuous fee from their P-Chain balance. If a validator is not topped up in time it goes inactive, so the balances need checking every day rather than whenever someone remembers.",
      },
      {
        heading: "How it is built",
        body: "Plain Node.js using only built-in modules: raw HTTPS calls to the P-Chain RPC and the Resend API, JSON files instead of a database, and a GitHub Actions cron that runs it every morning Bangkok time. Having no third-party dependencies keeps the job small and easy to audit.",
      },
    ],
  },
  {
    slug: "email-signature-generator",
    name: "Email Signature Generator",
    tagline: "Branded Gmail signatures, self-serve.",
    summary:
      "A single-page tool where staff at The Binary Holdings and The Binary Labs fill in a short form, see a live preview and copy a Gmail-ready signature in one click.",
    category: "Internal tool",
    role: "IT Manager",
    organization: "The Binary Holdings",
    period: "Sep 2026",
    year: 2026,
    access: "internal",
    stack: [
      "HTML",
      "CSS",
      "JavaScript",
      "Python",
      "Pillow",
      "librsvg",
      "GitHub Pages",
      "GitHub Actions",
    ],
    highlights: [
      "Company picker, with links that open straight on the right brand",
      "Live preview that updates as you type",
      "One-click copy as rich text with a plain-text fallback, plus raw HTML for IT",
      "Field checks for email format, company domain match and phone format",
      "Email-safe table markup with inline styles and 2x images for sharp logos on retina screens",
      "Runs entirely in the browser: nothing typed into the form is sent anywhere",
      "Image URLs never change: a deploy check blocks renames and a daily job confirms every image is still live",
    ],
    sections: [
      {
        heading: "The problem",
        body: "Staff needed one consistent, branded signature across two companies, and Gmail only shows signature images hosted at a public HTTPS address. The generator handles both: a form for the details and permanently hosted images for the logos.",
      },
      {
        heading: "How it is built",
        body: "One HTML file with no framework and no build step, published to GitHub Pages by GitHub Actions. A small Python script renders the logo and icon PNGs with Pillow and librsvg.",
      },
    ],
  },
  {
    slug: "ai-automation",
    name: "AI Automation",
    tagline: "AI agents for content ops and hiring.",
    summary:
      "A team-built set of internal AI agents at The Binary Holdings. The main one, Fando, finds sports clips, has Gemini judge and caption them, queues them for human approval and publishes the approved ones.",
    category: "AI agents",
    role: "Co-builder (team project)",
    organization: "The Binary Holdings",
    period: "Mar to Apr 2026",
    year: 2026,
    access: "internal",
    stack: [
      "Python",
      "Google ADK",
      "Google Gemini",
      "Vertex AI",
      "Google Cloud Storage",
      "Google Sheets API",
      "YouTube Data API",
      "Apify",
      "yt-dlp",
      "ffmpeg",
      "Playwright",
      "FastAPI",
      "Supabase",
      "Resend",
      "GitHub Actions",
    ],
    highlights: [
      "Clip sourcing from YouTube, Instagram, TikTok, Twitch and X",
      "Gemini checks that each clip is real match content and writes its title and caption",
      "Duplicate detection with perceptual image hashing",
      "A Google Sheet as the human approval queue",
      "Approved clips are trimmed, stored in Cloud Storage and published through a Playwright browser flow",
      "A recruitment agent that scores resumes, grades take-home cases and sends interview invites, with human review for borderline candidates",
    ],
    sections: [
      {
        heading: "The problem",
        body: "Finding, checking and re-uploading short clips was manual work, one clip at a time. The agents take over the repetitive steps and leave the judgement call, approve or reject, to a person.",
      },
      {
        heading: "How it is built",
        body: "Python agents on Google's Agent Development Kit with Gemini models, deployable to Vertex AI Agent Engine. Media handling uses yt-dlp and ffmpeg, and the recruitment agent is a FastAPI service. CI runs ruff, mypy and pytest on GitHub Actions.",
      },
    ],
  },
];

export function getAllPortfolioProjects(): readonly PortfolioProject[] {
  return PORTFOLIO_PROJECTS;
}

export function getPortfolioProjectBySlug(
  slug: string,
): PortfolioProject | null {
  return PORTFOLIO_PROJECTS.find((p) => p.slug === slug) ?? null;
}

export function getAllPortfolioSlugs(): readonly string[] {
  return PORTFOLIO_PROJECTS.map((p) => p.slug);
}

/** Previous / next project in list order, wrapping at both ends. */
export function getAdjacentPortfolioProjects(slug: string): {
  prev: PortfolioProject | null;
  next: PortfolioProject | null;
} {
  const index = PORTFOLIO_PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1 || PORTFOLIO_PROJECTS.length < 2) {
    return { prev: null, next: null };
  }
  const count = PORTFOLIO_PROJECTS.length;
  return {
    prev: PORTFOLIO_PROJECTS[(index - 1 + count) % count] ?? null,
    next: PORTFOLIO_PROJECTS[(index + 1) % count] ?? null,
  };
}

/** Page title without a trailing period, e.g. "TBH Intranet: One back office…". */
export function portfolioProjectTitle(project: PortfolioProject): string {
  return `${project.name}: ${project.tagline.replace(/\.$/, "")}`;
}
