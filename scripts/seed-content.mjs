/**
 * One-shot seed: author + welcome post.
 *
 * Idempotent: uses `createIfNotExists`, so safe to re-run — it will NOT
 * overwrite any documents you've edited in Studio.
 *
 * Usage:
 *   SANITY_TOKEN=<editor-token> pnpm seed
 *
 * The token needs Editor (or higher) role in Sanity Manage → API → Tokens.
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
      "Working notes on starting and running companies. Fundraising, hiring, product, the unglamorous operational stuff that fills most weeks. Some of it will be useful. Some of it will be wrong, and I'll come back and say so.",
    ),
    block("h2", "Cadence"),
    block(
      "normal",
      "Aiming for roughly one entry a week. Long enough to be worth your time, short enough that I can actually publish it.",
    ),
    block("h2", "How this site is built"),
    block(
      "normal",
      "Next.js 16 + Tailwind v4 for the frontend, Sanity v4 for the CMS, Railway for hosting. The blog uses ISR with tag-based revalidation triggered by a webhook from Sanity. The code is open: github.com/KunanonJ/fronk-website.",
    ),
  ],
};

async function main() {
  const tx = client
    .transaction()
    .createIfNotExists(author)
    .createIfNotExists(post);
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
