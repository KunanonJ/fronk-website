import { describe, expect, it } from "vitest";
import { loadOgFonts } from "./fonts";

describe("loadOgFonts", () => {
  it("loadOgFonts__given_missing_worker_bundle_files__then_falls_back_without_throwing", () => {
    const fonts = loadOgFonts(() => {
      throw new Error("missing font file");
    });

    expect(fonts).toEqual([]);
  });
});
