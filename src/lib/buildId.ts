/*
 * This build's id (vite.config.mts defines `__BUILD_ID__` once per build).
 * Every page carries it on `<html data-build>`, prerendered or rendered on
 * request, and the Worker knows its own: src/server/negotiate.ts keeps a
 * page at the edge for a day only when the two match.
 *
 * Why (20-11-26): while a deploy rolls out, the new Worker can be handed the
 * previous build's static HTML for a few seconds. Kept a day under the new
 * version's cache key, that page pointed at scripts the deploy had deleted,
 * and Chrome got an unstyled home page that never ran. A page of another
 * build is now answered and kept nowhere.
 *
 * Unit tests and the dev server have no define: their id is "dev".
 */
declare const __BUILD_ID__: string | undefined;

export const BUILD_ID: string =
  typeof __BUILD_ID__ === "string" ? __BUILD_ID__ : "dev";

/** The attribute as React renders it on `<html>`. */
export const BUILD_MARK = `data-build="${BUILD_ID}"`;
