#!/usr/bin/env node
/**
 * Deploys extracted studio schema to Sanity Cloud when SANITY_AUTH_TOKEN is set.
 * Skips silently in local builds without a deploy token.
 *
 * In Cloudflare Workers Builds (WORKERS_CI) it deploys only from the
 * production branch: every other branch, a Dependabot one included, is built
 * too, and must not put its unmerged schema into the production workspace.
 */
import { spawnSync } from "node:child_process";

/** The branch Workers Builds deploys to production. */
const PRODUCTION_BRANCH = "main";

const token = process.env.SANITY_AUTH_TOKEN?.trim();

if (!token) {
  console.log(
    "Skipping sanity schema deploy (set SANITY_AUTH_TOKEN for Dashboard compatibility).",
  );
  process.exit(0);
}

const branch = process.env.WORKERS_CI_BRANCH;
if (process.env.WORKERS_CI && branch !== PRODUCTION_BRANCH) {
  console.log(
    `Skipping sanity schema deploy on branch ${branch ?? "(unknown)"}: only ${PRODUCTION_BRANCH} deploys the schema.`,
  );
  process.exit(0);
}

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "sanity",
    "schema",
    "deploy",
    "--manifest-dir",
    "public/studio/static",
  ],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
