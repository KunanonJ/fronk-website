#!/usr/bin/env node
/**
 * Deploys extracted studio schema to Sanity Cloud when SANITY_AUTH_TOKEN is set.
 * Skips silently in local builds without a deploy token.
 */
import { spawnSync } from "node:child_process";

const token = process.env.SANITY_AUTH_TOKEN?.trim();

if (!token) {
  console.log(
    "Skipping sanity schema deploy (set SANITY_AUTH_TOKEN for Dashboard compatibility).",
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
