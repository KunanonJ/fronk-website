import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Regression guard for the tab-favicon bug: a static app/favicon.ico (the
// create-next-app default) was shadowing the generated app/icon.tsx "K"
// monogram in the browser tab. The fix is to have no favicon.ico at all, so
// app/icon.tsx is the single source for the icon. If a favicon.ico ever comes
// back it will out-rank icon.tsx again — so we assert it stays gone.
// vitest runs with the project root as cwd (see vitest.config.mts).
const appDir = resolve(process.cwd(), "app");

describe("browser tab favicon", () => {
  it("has no static favicon.ico shadowing the generated icon", () => {
    expect(existsSync(resolve(appDir, "favicon.ico"))).toBe(false);
  });

  it("keeps app/icon.tsx as the single icon source", () => {
    expect(existsSync(resolve(appDir, "icon.tsx"))).toBe(true);
  });
});
