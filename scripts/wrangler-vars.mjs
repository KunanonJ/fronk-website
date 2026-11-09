import { readFileSync } from "node:fs";

/**
 * The `vars` of a wrangler JSONC config. The Vite build inlines NEXT_PUBLIC_*
 * values at build time, so it reads them from the same wrangler file the
 * Worker runs with: a build is complete without extra CI variables, and
 * build-time and runtime values cannot drift apart.
 */
export function readWranglerVars(configPath) {
  return parseJsonc(readFileSync(configPath, "utf8")).vars ?? {};
}

/** JSON with comments and trailing commas (wrangler's JSONC). */
export function parseJsonc(text) {
  let out = "";
  let inString = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (ch === "\\") {
        out += next ?? "";
        i += 1;
      } else if (ch === '"') {
        inString = false;
      }
    } else if (ch === '"') {
      inString = true;
      out += ch;
    } else if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
    } else if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/"))
        i += 1;
      i += 1;
    } else {
      out += ch;
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1"));
}
