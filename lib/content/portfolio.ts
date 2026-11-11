/**
 * Portfolio: internal tools, automations and AI agents built at The Binary
 * Holdings, and this site. Separate from Ventures (founder companies in
 * `ventures.ts`).
 *
 * Honesty rule (same as ventures): every claim restates something the
 * project's own source or docs show. No invented numbers, clients or outcomes,
 * and nothing internal (hostnames, IDs, balances, staff or partner names).
 *
 * One more source since recruiter-fit phase 3: what the owner states in his
 * CV. `outcomes` restate a résumé bullet word for word in `source`, and the
 * owner said which project each bullet describes; `myPart` uses the CV's verbs
 * and his answer on which systems he wrote code for. What he cleared is
 * listed in `portfolioOutcomes.test.ts`, which fails on an outcome, or a
 * "wrote code" claim, that is not in its lists.
 *
 * Adding screenshots:
 *   1. Drop files into `public/portfolio/<slug>/` (e.g. `cover.png`, `shot-1.png`).
 *      16:10 crops look best on cards; any size works on the detail page.
 *   2. Register them on the project below as `cover` and/or `gallery` with
 *      `src: "/portfolio/<slug>/<file>"`, a real `alt`, and pixel `width`/`height`.
 *   Until a `cover` is set, cards and the detail "Interface" card show the
 *   code-drawn `mockup`; with neither, the visual is left out.
 *   `portfolio.test.ts` fails if a registered image file is missing.
 */

import type { VisualIconId } from "@/lib/content/visualIcons";
import { PAGE_META } from "@/lib/content/pageMeta";

export interface PortfolioImage {
  /** Site-relative path under `/portfolio/<slug>/`. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Diagrams drawn in code (see `components/landing/portfolio/`). Same honesty
 * rule as the copy: steps and components restate what the project's source
 * shows; mockups hold no real data and are captioned as illustrative.
 */
export interface PortfolioWorkflowStep {
  label: string;
  detail?: string;
  icon?: VisualIconId;
}

export interface PortfolioWorkflow {
  /** Short name for the flow, e.g. "Approval flow". */
  title: string;
  steps: readonly PortfolioWorkflowStep[];
}

export interface PortfolioArchitectureNode {
  label: string;
  note?: string;
}

export interface PortfolioArchitecture {
  /** Top to bottom: who uses it, then the app, services, and hosting. */
  layers: readonly {
    label: string;
    nodes: readonly PortfolioArchitectureNode[];
  }[];
}

export type PortfolioMockup =
  | {
      kind: "app-shell";
      title: string;
      nav: readonly string[];
      tiles: readonly string[];
    }
  | {
      kind: "email-report";
      subject: string;
      status: string;
      columns: readonly string[];
    }
  | { kind: "form-preview"; fields: readonly string[]; action: string }
  | { kind: "review-queue"; title: string; columns: readonly string[] };

/** An outcome of a project, restated from the owner's CV. */
export interface PortfolioOutcome {
  /** What is measured, e.g. "Adoption". */
  label: string;
  /** The figure or the change, e.g. "50+ employees". */
  value: string;
  /** The résumé bullet this restates, word for word. */
  source: string;
}

/**
 * `organization` of a project that is the owner's own and not an employer's
 * (this site). The text endpoints list such projects apart, and the JSON-LD
 * names no organisation as their source.
 */
export const PERSONAL_PROJECT = "Personal project";

export function isPersonalProject(project: PortfolioProject): boolean {
  return project.organization === PERSONAL_PROJECT;
}

/** An outcome on one line, for cards and text endpoints: "Adoption: 50+ employees". */
export function outcomeLine(outcome: PortfolioOutcome): string {
  return `${outcome.label}: ${outcome.value}`;
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
  /** Internal tools carry no public link. */
  access: "internal" | "public";
  url?: string;
  urlLabel?: string;
  stack: readonly string[];
  highlights: readonly string[];
  /** First section is "The problem", then "How it is built". */
  sections: readonly { heading: string; body: string }[];
  /**
   * What the project replaced, restated from its own copy, for the "The
   * problem" card. Only where the copy names both sides.
   */
  beforeAfter?: { before: string; after: string };
  /**
   * What changed, as the owner states it in his CV. Each restates a résumé
   * bullet, and the owner mapped it to this project (11-11-26).
   */
  outcomes?: readonly PortfolioOutcome[];
  /**
   * The owner's part: the CV's verbs for this work, and his answer on which
   * systems he wrote code for (11-11-26). Never "solo-built".
   */
  myPart?: string;
  cover?: PortfolioImage;
  gallery?: readonly PortfolioImage[];
  /** Illustrative UI; used as the cover until a screenshot is registered. */
  mockup?: PortfolioMockup;
  workflow?: PortfolioWorkflow;
  architecture?: PortfolioArchitecture;
}

/** One line of a hero h1: words, some muted (bento canvas). */
export type HeadlineLine = readonly { text: string; muted?: boolean }[];

export const portfolioPage = {
  eyebrow: "Portfolio",
  title: "Selected work",
  /** The h1 in three lines (bento canvas); the last is the accent line. */
  headline: [
    [{ text: "Selected work:", muted: true }, { text: "internal tools," }],
    [{ text: "automations" }, { text: "and", muted: true }],
    [{ text: "AI agents." }],
  ] satisfies readonly HeadlineLine[],
  /** Every project is his work: the byline on each project page. */
  author: { name: "Kunanon Jarat", href: "/about" },
  /** The card that closes each project page: where a hiring reader goes next. */
  hire: {
    kicker: "Hiring",
    heading: "Want work like this on your team?",
    resumeLabel: "Résumé",
    contactLabel: "Contact",
  },
  description: PAGE_META.portfolio.description,
} as const;

const PORTFOLIO_PROJECTS: readonly PortfolioProject[] = [
  {
    slug: "tbh-intranet",
    name: "TBH Intranet",
    tagline: "One back office for a multi-entity group.",
    summary:
      "An internal operations platform built to replace Zoho at The Binary Holdings, bringing HR, approvals, Thai accounting, expenses, CRMs and an AI assistant into one login-only web app.",
    category: "Internal platform",
    role: "IT Manager & AI Engineering Lead",
    organization: "The Binary Holdings",
    period: "May to Oct 2026",
    year: 2026,
    access: "internal",
    beforeAfter: { before: "Zoho", after: "One login-only web app" },
    outcomes: [
      {
        label: "Adoption",
        value: "50+ employees",
        source:
          "Owned the roadmap and requirements for an internal platform covering CRM, support, HR, project management and AI assistance; achieved adoption by 50+ employees.",
      },
      {
        label: "Build cycles",
        value: "4 months to 1 week",
        source:
          "Partnered with engineering and strategy from requirements through launch; build cycles for the internal company platform fell from 4 months to 1 week.",
      },
    ],
    myPart:
      "Owned the roadmap and requirements, and wrote code for the platform and for ARIA, its assistant. Led delivery of ARIA as a private-data knowledge platform for competitive analysis and executive decision support, and partnered with engineering and strategy from requirements through launch.",
    mockup: {
      kind: "app-shell",
      title: "Intranet",
      nav: ["Dashboard", "HR", "Approvals", "Accounting", "CRM", "ARIA"],
      tiles: [
        "Leave requests",
        "Pending approvals",
        "Expenses",
        "Company news",
      ],
    },
    workflow: {
      title: "Approval flow",
      steps: [
        {
          label: "Submit a request",
          detail: "Leave, travel or expense",
          icon: "filetext",
        },
        {
          label: "Approval chain",
          detail: "Each approver signs off in turn",
          icon: "listchecks",
        },
        {
          label: "Recorded",
          detail: "Lands in the HR or accounting module",
          icon: "database",
        },
        {
          label: "Notified",
          detail: "Requester hears back in the app and by push",
          icon: "bell",
        },
      ],
    },
    architecture: {
      layers: [
        {
          label: "Users",
          nodes: [
            {
              label: "Staff",
              note: "Browser, installable web app",
            },
          ],
        },
        {
          label: "Web app",
          nodes: [
            { label: "Next.js 16", note: "React 19" },
            { label: "Tailwind CSS 4" },
            { label: "shadcn/ui" },
          ],
        },
        {
          label: "API",
          nodes: [
            { label: "Express 5", note: "Zod validation" },
            {
              label: "Socket.IO",
              note: "Real-time features",
            },
          ],
        },
        {
          label: "Services",
          nodes: [
            {
              label: "PostgreSQL",
              note: "On Supabase, via Prisma",
            },
            { label: "Supabase Auth + Storage" },
            {
              label: "Google Gemini",
              note: "ARIA assistant, embedding search",
            },
            { label: "Claude", note: "ARIA assistant" },
            {
              label: "Integrations",
              note: "Gmail, Sheets, Bank of Thailand FX rates, PostHog",
            },
          ],
        },
        {
          label: "Build + hosting",
          nodes: [
            { label: "Turborepo", note: "Monorepo" },
            { label: "Vercel", note: "Hosting + cron" },
            {
              label: "GitHub Actions",
              note: "CI with Vitest + Playwright",
            },
          ],
        },
      ],
    },
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
    role: "IT Manager & AI Engineering Lead",
    organization: "The Binary Holdings",
    period: "May to Sep 2026",
    year: 2026,
    access: "internal",
    myPart: "Wrote code for it.",
    mockup: {
      kind: "email-report",
      subject: "Validator health report",
      status: "All validators healthy",
      columns: ["Validator", "Balance", "Runway", "Status"],
    },
    workflow: {
      title: "Daily run",
      steps: [
        {
          label: "Scheduled run",
          detail: "GitHub Actions, every morning Bangkok time",
          icon: "clock",
        },
        {
          label: "Read validators",
          detail: "Current set from the P-Chain over JSON-RPC",
          icon: "server",
        },
        {
          label: "Compare with yesterday",
          detail: "Burn rate and days of runway",
          icon: "trendingdown",
        },
        {
          label: "Check alert rules",
          detail: "Low balance, short runway, inactive, sharp drop",
          icon: "shieldalert",
        },
        {
          label: "Email the report",
          detail: "Resend, with a fallback if sending fails",
          icon: "mail",
        },
        {
          label: "Save the snapshot",
          detail: "Committed to the repo as an audit trail",
          icon: "gitcommit",
        },
      ],
    },
    architecture: {
      layers: [
        {
          label: "Trigger",
          nodes: [
            {
              label: "GitHub Actions",
              note: "Daily cron",
            },
          ],
        },
        {
          label: "Job",
          nodes: [
            {
              label: "Node.js script",
              note: "Built-in modules only, no dependencies",
            },
          ],
        },
        {
          label: "Data in",
          nodes: [
            {
              label: "Avalanche P-Chain",
              note: "JSON-RPC over HTTPS",
            },
            {
              label: "Yesterday's snapshot",
              note: "JSON file",
            },
          ],
        },
        {
          label: "Out",
          nodes: [
            {
              label: "Resend",
              note: "HTML + plain-text email",
            },
            {
              label: "Git history",
              note: "Daily JSON snapshots",
            },
          ],
        },
      ],
    },
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
    role: "IT Manager & AI Engineering Lead",
    organization: "The Binary Holdings",
    period: "Sep 2026",
    year: 2026,
    access: "internal",
    myPart: "Wrote code for it.",
    mockup: {
      kind: "form-preview",
      fields: ["Name", "Title", "Email", "Phone", "Company"],
      action: "Copy signature",
    },
    workflow: {
      title: "From form to Gmail",
      steps: [
        {
          label: "Pick the company",
          detail: "Or open a company-specific link",
          icon: "building",
        },
        {
          label: "Fill in details",
          detail: "Checked as you type",
          icon: "pen",
        },
        {
          label: "Live preview",
          detail: "Email-safe HTML with 2x images",
          icon: "eye",
        },
        {
          label: "Copy",
          detail: "Rich text, plain-text fallback, or raw HTML for IT",
          icon: "copy",
        },
        {
          label: "Paste into Gmail",
          detail: "Into the signature settings",
          icon: "mail",
        },
      ],
    },
    architecture: {
      layers: [
        {
          label: "Browser",
          nodes: [
            {
              label: "Single HTML page",
              note: "Nothing typed leaves the browser",
            },
            { label: "CSS" },
            { label: "JavaScript" },
          ],
        },
        {
          label: "Assets",
          nodes: [
            {
              label: "Python build script",
              note: "Pillow + librsvg render the PNGs",
            },
            {
              label: "Permanent image URLs",
              note: "Gmail only shows public HTTPS images",
            },
          ],
        },
        {
          label: "Hosting",
          nodes: [
            { label: "GitHub Pages" },
            {
              label: "GitHub Actions",
              note: "Deploy + daily image check",
            },
          ],
        },
      ],
    },
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
    role: "AI Engineering Lead (team project)",
    organization: "The Binary Holdings",
    period: "Mar to Apr 2026",
    year: 2026,
    access: "internal",
    outcomes: [
      {
        label: "Recurring workflow staffing",
        value: "10 people to 1 operator",
        source:
          "Automated video sourcing, trimming, review and publishing; reduced recurring workflow staffing from 10 people to 1 operator, with a 30-minute turnaround.",
      },
      {
        label: "Turnaround",
        value: "30 minutes",
        source:
          "Automated video sourcing, trimming, review and publishing; reduced recurring workflow staffing from 10 people to 1 operator, with a 30-minute turnaround.",
      },
    ],
    myPart:
      "Automated video sourcing, trimming, review and publishing with the team, and wrote code for the agents.",
    mockup: {
      kind: "review-queue",
      title: "Clip review queue",
      columns: ["Clip", "Title", "Score", "Approve"],
    },
    workflow: {
      title: "Fando clip pipeline",
      steps: [
        {
          label: "Find clips",
          detail: "YouTube, Instagram, TikTok, Twitch and X",
          icon: "search",
        },
        {
          label: "Gemini review",
          detail: "Real match content? Writes title and caption",
          icon: "sparkles",
        },
        {
          label: "Skip duplicates",
          detail: "Perceptual image hashing",
          icon: "layers",
        },
        {
          label: "Human approval",
          detail: "Approve column in a Google Sheet",
          icon: "usercheck",
        },
        {
          label: "Trim and store",
          detail: "ffmpeg, 29-second cap, Cloud Storage",
          icon: "scissors",
        },
        {
          label: "Publish",
          detail: "Playwright posts to the CMS and checks it is live",
          icon: "send",
        },
      ],
    },
    architecture: {
      layers: [
        {
          label: "Sources",
          nodes: [
            { label: "YouTube Data API" },
            { label: "Apify", note: "Instagram" },
            { label: "yt-dlp", note: "Downloads" },
          ],
        },
        {
          label: "Agents",
          nodes: [
            {
              label: "Python agents",
              note: "Google Agent Development Kit",
            },
            {
              label: "Vertex AI Agent Engine",
              note: "Deployment target",
            },
          ],
        },
        {
          label: "AI",
          nodes: [
            {
              label: "Gemini",
              note: "Relevance, titles, captions",
            },
          ],
        },
        {
          label: "Human in the loop",
          nodes: [
            {
              label: "Google Sheets",
              note: "Approval queue",
            },
          ],
        },
        {
          label: "Media + publishing",
          nodes: [
            { label: "ffmpeg", note: "Trim" },
            { label: "Cloud Storage" },
            {
              label: "Playwright",
              note: "Browser publishing to the CMS",
            },
          ],
        },
        {
          label: "Also in the repo",
          nodes: [
            {
              label: "Recruitment agent",
              note: "FastAPI, Supabase, Resend",
            },
          ],
        },
      ],
    },
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
  {
    // This site (recruiter-fit phase 3; owner: "Yes, add it", 11-11-26). The
    // one project that is public and not built at The Binary Holdings. Every
    // line restates what the repository shows: its README, its configuration
    // (package.json, wrangler.jsonc, vite.config.mts, .github/workflows/ci.yml),
    // its source and its commit history. It states no outcome and no "my
    // part": the CV does not mention the site, so neither is cleared.
    slug: "kunanonj-com",
    name: "kunanonj.com",
    tagline: "A personal site for people and for AI agents.",
    summary:
      "The site you are reading: a résumé, case studies and topic hubs, with the same facts published as plain text and structured data for AI agents. Built on TanStack Start and Cloudflare Workers, with the source public on GitHub.",
    category: "Website",
    role: "Owner",
    organization: PERSONAL_PROJECT,
    period: "2026",
    year: 2026,
    access: "public",
    url: "https://github.com/KunanonJ/fronk-website",
    urlLabel: "Source on GitHub",
    // A real screenshot, not a mockup: the site is public, and the app-shell
    // mockup (a sidebar dashboard) looks nothing like it. Home at 1440 x 900
    // in the light theme, from a production build, saved as lossless WebP.
    // Capture it again when Home changes.
    cover: {
      src: "/portfolio/kunanonj-com/cover.webp",
      alt: "The Home page of kunanonj.com: the headline Forward deployed AI engineering from Bangkok, the Open to roles line, the Contact me and Résumé buttons, and the Selected work and Experience cards",
      width: 1440,
      height: 900,
    },
    workflow: {
      title: "From change to production",
      steps: [
        {
          label: "Plan",
          detail: "A written plan with its checks, kept in the repo",
          icon: "filetext",
        },
        {
          label: "Build",
          detail: "Code with its unit tests",
          icon: "gitcommit",
        },
        {
          label: "Checks",
          detail: "Types, lint, tests, a build and browser runs",
          icon: "listchecks",
        },
        {
          label: "Preview",
          detail: "Each branch uploads its own Worker version",
          icon: "eye",
        },
        {
          label: "Deploy",
          detail: "A merge to main ships the Worker",
          icon: "send",
        },
      ],
    },
    architecture: {
      layers: [
        {
          label: "Readers",
          nodes: [
            { label: "People", note: "Pages in light and dark" },
            {
              label: "AI agents and crawlers",
              note: "Text files, Markdown twins, JSON-LD",
            },
          ],
        },
        {
          label: "Web app",
          nodes: [
            { label: "TanStack Start", note: "React, rendered on the server" },
            { label: "Prerendered pages", note: "Built once per deploy" },
            {
              label: "Server routes",
              note: "Text endpoints, share images, contact form",
            },
          ],
        },
        {
          label: "Content",
          nodes: [
            { label: "Typed content modules", note: "Key facts held by tests" },
            {
              label: "Sanity",
              note: "Résumé edits, with a fallback in the repo",
            },
          ],
        },
        {
          label: "Hosting",
          nodes: [
            { label: "Cloudflare Workers", note: "Static assets, edge cache" },
            { label: "GitHub Actions", note: "Checks on every pull request" },
          ],
        },
      ],
    },
    stack: [
      "TypeScript",
      "React",
      "TanStack Start",
      "TanStack Router",
      "TanStack Query",
      "TanStack Form",
      "Tailwind CSS",
      "Vite",
      "Valibot",
      "Sanity",
      "Cloudflare Workers",
      "Vitest",
      "Playwright",
      "GitHub Actions",
    ],
    highlights: [
      "Pages that read only the content modules are rendered once per deploy and served as static files",
      "The résumé page asks Sanity for an edited version on request and is cached at the edge; it shows the copy in the repo when Sanity holds none or cannot be read",
      "The same facts as text for AI agents: llms.txt, a full profile in one file, agents.md and a Markdown twin of each project page",
      "Structured data for the profile, the projects, the ventures and the topic hubs, and a share image drawn in code for each of them",
      "Topic hubs in English and Thai, each pointing to its other language",
      "Tests pin the résumé's role periods, and hold the current role's start month to one wording in the summary and on the forward-deployed hub, in English and Thai",
      "The résumé PDF is generated from the résumé page",
      "Every pull request runs type checks, lint, unit tests, a build with a first-load budget, smoke and accessibility tests, visual comparisons and a crawl compared with a reference",
    ],
    sections: [
      {
        heading: "The problem",
        body: "The site has two readers: a person deciding whether to get in touch, and the search and answer engines that summarise it first. Both need the same facts, so the text files and the structured data are generated from the repo's content modules, and tests hold the current role, the case-study figures and the user count to one wording.",
      },
      {
        heading: "How it is built",
        body: "TanStack Start on Cloudflare Workers. Pages that read only the content modules are prerendered at deploy; pages that read Sanity render on request and are cached at the edge. The repository keeps its own process beside the code: written plans, phase reports and instructions for AI coding agents, and many of its commits name one as co-author.",
      },
    ],
  },
];

export function getAllPortfolioProjects(): readonly PortfolioProject[] {
  return PORTFOLIO_PROJECTS;
}

/**
 * Home "Selected work", in this order (bento canvas; owner default 09-11-26).
 * Separate from the list order above, which drives the portfolio index and
 * prev/next.
 */
export const FEATURED_PORTFOLIO_SLUGS = [
  "tbh-intranet",
  "ai-automation",
  "node-validator-automation",
] as const;

export function getFeaturedPortfolioProjects(): readonly PortfolioProject[] {
  return FEATURED_PORTFOLIO_SLUGS.map((slug) => {
    const project = getPortfolioProjectBySlug(slug);
    if (!project) throw new Error(`Featured project "${slug}" is missing`);
    return project;
  });
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
