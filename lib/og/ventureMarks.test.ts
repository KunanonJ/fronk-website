import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getAllVentures } from "@/lib/content/ventures";
import { ventureMark } from "./ventureMarks";

describe("ventureMark", () => {
  it("bundles each venture's logoPng, byte for byte", () => {
    for (const venture of getAllVentures()) {
      const mark = ventureMark(venture.slug);
      expect(mark, venture.slug).toMatch(/^data:image\/png;base64,/);
      const file = readFileSync(join(process.cwd(), "public", venture.logoPng));
      expect(mark!.slice(mark!.indexOf(",") + 1)).toBe(file.toString("base64"));
    }
  });

  it("has none for a slug that names no venture", () => {
    expect(ventureMark("not-a-venture")).toBeUndefined();
  });
});
