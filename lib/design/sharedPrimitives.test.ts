import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";

/**
 * The bento card surface lives in one place (components/bento/classes.ts),
 * and no page writes the old hero h1 or lead by hand. Copies drift: before
 * this guard there were seven card surfaces and nine hand-written hero h1s.
 * The mono label and the bento PageHero went once Phase 7 restyled their
 * last pages.
 */
const files = sourceFiles(["components", "src/routes"]);

function filesContaining(pattern: RegExp, except: readonly string[] = []) {
  return files.filter((f) => !except.includes(f) && pattern.test(read(f)));
}

describe("shared bento primitives", () => {
  // Variants that differ on purpose (a tighter bottom padding, a tile without
  // overflow clipping) keep their own strings: cn() joins without merging.
  it("defines the standard card surface only in classes.ts", () => {
    expect(
      filesContaining(
        /rounded-bento border border-hairline bg-surface px-5 pt-\[18px\] pb-5 text-ink shadow-card/,
      ),
    ).toEqual([]);
  });

  it("writes no old hero h1 or lead by hand", () => {
    expect(
      filesContaining(/<h1 id="hero-title" className="kj-lines m-0 text-title/),
    ).toEqual([]);
    expect(
      filesContaining(
        /"m-0 max-w-\[620px\] text-lg leading-\[1\.55\] text-ink-2"/,
      ),
    ).toEqual([]);
  });
});
