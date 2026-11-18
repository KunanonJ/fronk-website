import { describe, expect, it } from "vitest";
import { isZoomSafeClamp, parseClamp, remValue } from "@/lib/design/fluidType";

describe("isZoomSafeClamp", () => {
  it("accepts a largest size up to 2.5 times the smallest", () => {
    expect(isZoomSafeClamp(2.625, 6)).toBe(true); // the display size, 2.29x
    expect(isZoomSafeClamp(1.75, 4.375)).toBe(true); // exactly 2.5x
  });

  it("rejects a spread that 500% zoom cannot double", () => {
    expect(isZoomSafeClamp(1, 2.6)).toBe(false);
  });

  it("rejects sizes that are not a real range", () => {
    expect(isZoomSafeClamp(0, 1)).toBe(false);
    expect(isZoomSafeClamp(2, 1)).toBe(false);
    expect(isZoomSafeClamp(Number.NaN, 1)).toBe(false);
  });
});

describe("parseClamp", () => {
  it("keeps a nested min() as the preferred value", () => {
    expect(
      parseClamp(
        "clamp(2.625rem, min(5.4vw + 0.625rem, 8.4svh + 0.25rem), 6rem)",
      ),
    ).toEqual({
      min: "2.625rem",
      preferred: "min(5.4vw + 0.625rem, 8.4svh + 0.25rem)",
      max: "6rem",
    });
  });

  it("returns null for anything but a three-part clamp", () => {
    expect(parseClamp("min(1rem, 2vw)")).toBeNull();
    expect(parseClamp("clamp(1rem, 2rem)")).toBeNull();
  });
});

describe("remValue", () => {
  it("reads rem lengths only", () => {
    expect(remValue("1.0625rem")).toBe(1.0625);
    expect(remValue("17px")).toBeNull();
  });
});
