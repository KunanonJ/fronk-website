import { describe, expect, it } from "vitest";
import { keepLastWordsTogether, keepNamesWhole } from "@/lib/content/keepWhole";

const NBSP = "\u00a0";

describe("keepNamesWhole", () => {
  it("joins the words of each name with no-break spaces, and nothing else", () => {
    const text =
      "Building GoGoCash and Manut AI. Previously IT Manager & AI Engineering Lead at The Binary Holdings.";
    const kept = keepNamesWhole(text);
    expect(kept).toContain(`Manut${NBSP}AI`);
    expect(kept).toContain(`The${NBSP}Binary${NBSP}Holdings`);
    expect(kept).toContain(`IT${NBSP}Manager & AI Engineering Lead`);
    // The words are the same; only the spaces inside the names changed.
    expect(kept.replaceAll(NBSP, " ")).toBe(text);
    expect(kept.match(/\u00a0/g)).toHaveLength(4);
  });

  it("leaves text without the names as it is", () => {
    expect(keepNamesWhole("GoGoCash, from Bangkok.")).toBe(
      "GoGoCash, from Bangkok.",
    );
  });
});

describe("keepLastWordsTogether", () => {
  it("joins only the last two words", () => {
    expect(keepLastWordsTogether("startups in Bangkok.")).toBe(
      `startups in${NBSP}Bangkok.`,
    );
    expect(keepLastWordsTogether("Bangkok.")).toBe("Bangkok.");
  });
});
