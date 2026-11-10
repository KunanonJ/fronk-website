import { describe, expect, it } from "vitest";
import { read, sourceFiles } from "@/lib/design/sourceScan";
import { pad2 } from "./pad2";

describe("pad2", () => {
  it("pads indexes and counts to two digits", () => {
    expect(pad2(1)).toBe("01");
    expect(pad2(12)).toBe("12");
    expect(pad2(0)).toBe("00");
  });

  it("is the only two-digit padding in the components", () => {
    const copies = sourceFiles(["components", "src/routes", "lib"]).filter(
      (f) => /padStart\(2,\s*"0"\)/.test(read(f)),
    );
    expect(copies).toEqual([]);
  });
});
