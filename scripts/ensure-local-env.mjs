#!/usr/bin/env node
/** Ensure local env has CRON_SECRET, SANITY_PREVIEW_SECRET, and SITE_URL. */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const path = ".env.local";
let content = existsSync(path) ? readFileSync(path, "utf8") : "";

function hasKey(key) {
  return new RegExp(`^${key}=`, "m").test(content);
}

function appendKey(key, value) {
  if (hasKey(key)) return;
  content = `${content.trimEnd()}\n${key}=${value}\n`;
}

appendKey("CRON_SECRET", randomBytes(32).toString("hex"));
appendKey("SANITY_PREVIEW_SECRET", randomBytes(32).toString("hex"));

if (hasKey("NEXT_PUBLIC_SITE_URL")) {
  content = content.replace(
    /^NEXT_PUBLIC_SITE_URL=.*$/m,
    "NEXT_PUBLIC_SITE_URL=https://kunanonj.com",
  );
} else {
  content = `${content.trimEnd()}\nNEXT_PUBLIC_SITE_URL=https://kunanonj.com\n`;
}

writeFileSync(path, `${content.trim()}\n`);
console.log("Updated .env.local (CRON_SECRET, SANITY_PREVIEW_SECRET, SITE_URL).");
