import { describe, expect, it } from "vitest";
import {
  countFrame,
  easeOutExpo,
  parseFigure,
  type Figure,
} from "@/lib/motion/countUp";

/*
 * Count-ups (plan morph-count-up_PLAN_20-11-26): only one number with words
 * or signs around it counts, and no frame ever shows more than the figure.
 */
describe("parseFigure", () => {
  it("reads the site's cleared figures: the number, and what is around it", () => {
    expect(parseFigure("1,000")).toEqual({
      prefix: "",
      target: 1000,
      decimals: 0,
      grouped: true,
      suffix: "",
    });
    expect(parseFigure("220+")).toMatchObject({ target: 220, suffix: "+" });
    expect(parseFigure("30%")).toMatchObject({ target: 30, suffix: "%" });
    expect(parseFigure("THB 2 million")).toMatchObject({
      prefix: "THB ",
      target: 2,
      grouped: false,
      suffix: " million",
    });
    expect(parseFigure("THB 48,500")).toMatchObject({
      prefix: "THB ",
      target: 48500,
      grouped: true,
    });
    expect(parseFigure("4.5x")).toMatchObject({
      target: 4.5,
      decimals: 1,
      suffix: "x",
    });
  });

  it("leaves anything else as it is: words, years, ranges, zero", () => {
    for (const value of [
      "Founder",
      "2019 to 2024",
      "4 months to 1 week",
      "1,00",
      "0",
      "",
    ]) {
      expect(parseFigure(value), value).toBeNull();
    }
  });
});

describe("countFrame", () => {
  const figure = (value: string) => parseFigure(value) as Figure;

  it("starts at zero with the figure's words and ends on the figure", () => {
    expect(countFrame(figure("THB 48,500"), 0)).toBe("THB 0");
    expect(countFrame(figure("THB 48,500"), 1)).toBe("THB 48,500");
    expect(countFrame(figure("220+"), 0)).toBe("0+");
    expect(countFrame(figure("220+"), 1)).toBe("220+");
    expect(countFrame(figure("4.5x"), 0)).toBe("0.0x");
    expect(countFrame(figure("4.5x"), 1)).toBe("4.5x");
  });

  it("groups thousands as the source does, and never passes the figure", () => {
    const thousand = figure("1,000");
    let last = -1;
    for (let step = 0; step <= 100; step++) {
      const frame = countFrame(thousand, step / 100);
      const value = Number(frame.replaceAll(",", ""));
      expect(value).toBeGreaterThanOrEqual(last);
      expect(value).toBeLessThanOrEqual(1000);
      if (value >= 1000) expect(frame).toBe("1,000");
      last = value;
    }
    expect(countFrame(figure("1000"), 1)).toBe("1000");
  });

  it("clamps progress outside 0 to 1", () => {
    expect(countFrame(figure("30%"), -1)).toBe("0%");
    expect(countFrame(figure("30%"), 2)).toBe("30%");
  });
});

describe("easeOutExpo", () => {
  it("covers most of the way early and lands exactly on 1", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1 / 3)).toBeGreaterThan(0.85);
    expect(easeOutExpo(1)).toBe(1);
  });
});
