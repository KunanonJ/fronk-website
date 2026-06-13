/**
 * One-shot seed: site content + author + welcome post.
 *
 * Idempotent: uses `createIfNotExists`, so safe to re-run — it will NOT
 * overwrite any documents you've edited in Studio.
 *
 * Usage:
 *   SANITY_TOKEN=<editor-token> pnpm seed
 */
import { createClient } from "@sanity/client";
import { randomBytes } from "node:crypto";

const token = process.env.SANITY_TOKEN ?? process.env.SANITY_API_READ_TOKEN;
if (!token) {
  console.error("Missing SANITY_TOKEN (or SANITY_API_READ_TOKEN). Aborting.");
  process.exit(1);
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "nkspfk4b",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2025-01-01",
  token,
  useCdn: false,
});

const k = () => randomBytes(6).toString("hex");

const siteSettings = {
  _id: "siteSettings",
  _type: "siteSettings",
  name: "Fronk Kunanon Jarat",
  shortName: "Fronk",
  tagline: "Building fintech for Southeast Asia.",
  description:
    "Personal site of Kunanon Jarat (Fronk) — founder of GoGoCash, building fintech and adjacent infrastructure from Bangkok.",
  email: "fronk.kunanon@gmail.com",
  discordHandle: "fronk98",
  socials: {
    x: "https://x.com/fkj98",
    linkedin: "https://www.linkedin.com/in/kunanonj",
    github: "https://github.com/KunanonJ",
    telegram: "https://t.me/fkj98",
    farcaster: "https://farcaster.xyz/fronk98",
    website: "https://gogocash.co",
  },
  navigation: [
    { _type: "navItem", _key: k(), label: "Home", href: "/" },
    { _type: "navItem", _key: k(), label: "About", href: "/about" },
    { _type: "navItem", _key: k(), label: "Now", href: "/now" },
    { _type: "navItem", _key: k(), label: "Ventures", href: "/ventures" },
    { _type: "navItem", _key: k(), label: "Writing", href: "/writing" },
    { _type: "navItem", _key: k(), label: "Contact", href: "/contact" },
  ],
  footerTagline:
    "Building fintech and digital workspaces from Bangkok.",
};

const homePage = {
  _id: "homePage",
  _type: "homePage",
  heroEyebrow: "Currently shipping",
  heroTitle: "Fronk",
  heroTagline: "Building fintech for Southeast Asia.",
  featuredSectionKicker: "✦ Currently shipping",
  featuredSectionTitle: "Two bets. Both live.",
  featuredLimit: 3,
  writingTitle: "Currently writing",
  writingDescription:
    "Long-form notes on building from zero — fundraising, hiring, shipping, and the daily reality of running early-stage companies.",
  primaryCta: { _type: "cta", label: "See what I'm shipping", href: "/ventures" },
  secondaryCta: { _type: "cta", label: "Read writing", href: "/writing" },
  writingCta: { _type: "cta", label: "Read the journal", href: "/writing" },
};

const writingPage = {
  _id: "writingPage",
  _type: "writingPage",
  eyebrow: "Writing",
  heading: "Journal.",
  description:
    "Working notes on building, hiring, and shipping. Published roughly once a week.",
  seo: {
    title: "Writing",
    description:
      "Long-form notes on starting and running companies — fundraising, hiring, product, and the daily reality of building from zero.",
  },
};

const resumeProfile = {
  _id: "resumeProfile",
  _type: "resumeProfile",
  name: "Kunanon Jarat",
  headline: "Founder. IT Manager. Based in Bangkok.",
};

const standardPages = [
  {
    _id: "page-about",
    _type: "standardPage",
    title: "About",
    slug: { _type: "slug", current: "about" },
    eyebrow: "About",
    heading: "Founder, builder, operator.",
    description:
      "Kunanon Jarat (Fronk) — founder of GoGoCash, IT Manager at The Binary Holdings. Building fintech and adjacent infrastructure from Bangkok.",
  },
  {
    _id: "page-now",
    _type: "standardPage",
    title: "Now",
    slug: { _type: "slug", current: "now" },
    eyebrow: "Now",
    heading: "What I'm working on.",
    description:
      "What Fronk Kunanon Jarat is working on right now — building GoGoCash, running IT at The Binary Holdings, and what's currently on the desk in Bangkok.",
    lastUpdated: "2026-05-14",
  },
  {
    _id: "page-contact",
    _type: "standardPage",
    title: "Contact",
    slug: { _type: "slug", current: "contact" },
    eyebrow: "Contact",
    heading: "Say hello.",
    description: "Get in touch with Fronk Kunanon Jarat — email and social links.",
  },
  {
    _id: "page-ventures",
    _type: "standardPage",
    title: "Ventures",
    slug: { _type: "slug", current: "ventures" },
    eyebrow: "Ventures",
    heading: "What I'm building.",
    description:
      "Two active ventures, both grounded in Bangkok. One is a fintech, the other is an AI knowledge workspace. The links go straight to the products.",
    seo: {
      title: "Ventures",
      description:
        "Companies and products I've founded or co-founded. The wins, the shutdowns, and what each one taught me.",
    },
  },
];

const ventures = [
  {
    _id: "venture-gogocash",
    _type: "venture",
    name: "GoGoCash",
    slug: { _type: "slug", current: "gogocash" },
    tagline: "Shopping-to-earn cashback.",
    description:
      "A shopping-to-earn cashback platform. 1,000+ users earning up to 30% back across 220+ top merchants — Apple, Samsung, Lazada, Shopee, TikTok Shop, Temu, and more.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["Cashback", "E-commerce", "Affiliate"],
    url: "https://gogocash.co",
    urlLabel: "gogocash.co",
    featured: true,
    sortOrder: 1,
  },
  {
    _id: "venture-manut",
    _type: "venture",
    name: "Manut AI",
    slug: { _type: "slug", current: "manut" },
    tagline: "Notion on steroids, for solo entrepreneurs.",
    description:
      "An all-in-one workspace for solo entrepreneurs. Connects MongoDB, Meta, AI agents, and multiple AI models into a single platform — so you run your whole operation in one place instead of stitching together a dozen SaaS tools.",
    year: 2025,
    role: "Founder",
    status: "active",
    stack: ["AI agents", "MongoDB", "Self-hosted"],
    url: "https://manut.xyz",
    urlLabel: "manut.xyz",
    featured: true,
    sortOrder: 2,
  },
];

const author = {
  _id: "author-fronk",
  _type: "author",
  name: "Fronk Kunanon Jarat",
  bio: "Founder, builder, and writer. Notes on starting things and the daily reality of running early-stage companies.",
};

const block = (style, text) => ({
  _type: "block",
  _key: k(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: k(), text, marks: [] }],
});

const post = {
  _id: "post-welcome",
  _type: "post",
  title: "Welcome to the journal",
  slug: { _type: "slug", current: "welcome" },
  publishedAt: new Date().toISOString(),
  excerpt:
    "First entry. A quick note on what I plan to write here and how this site is built.",
  tags: ["meta", "first-post"],
  author: { _type: "reference", _ref: author._id },
  body: [
    block(
      "normal",
      "If you're reading this, the rest of the site is probably more interesting. This page exists mostly to prove the wiring works — Sanity Studio publishes content, the blog renders it, and ISR keeps things fresh.",
    ),
    block("h2", "What you'll find here"),
    block(
      "normal",
      "Working notes on starting and running companies. Fundraising, hiring, product, the unglamorous operational stuff that fills most weeks.",
    ),
  ],
};

async function main() {
  let tx = client.transaction();
  for (const doc of [
    siteSettings,
    homePage,
    writingPage,
    resumeProfile,
    ...standardPages,
    ...ventures,
    author,
    post,
  ]) {
    tx = tx.createIfNotExists(doc);
  }
  const result = await tx.commit();
  const summary = result.results.map((r) => ({ id: r.id, op: r.operation }));
  console.log("seed complete:", JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error("seed failed:", err?.message ?? err);
  if (err?.response?.body) {
    console.error(JSON.stringify(err.response.body, null, 2));
  }
  process.exit(1);
});
