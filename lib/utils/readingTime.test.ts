import { describe, expect, it } from "vitest";
import { readingTime, readingTimeFromBlocks } from "./readingTime";

describe("readingTime", () => {
  it("returns at least 1 minute for any non-empty text", () => {
    expect(readingTime("hello world").minutes).toBe(1);
  });

  it("counts words correctly", () => {
    expect(readingTime("one two three four five").words).toBe(5);
  });

  it("treats whitespace-only text as zero words but still 1 minute floor", () => {
    expect(readingTime("   \n\t  ").words).toBe(0);
    expect(readingTime("   \n\t  ").minutes).toBe(1);
  });
});

describe("readingTimeFromBlocks", () => {
  it("extracts text from PortableText-shaped blocks", () => {
    const blocks = [
      {
        _type: "block",
        children: [
          { _type: "span", text: "Hello there." },
          { _type: "span", text: "How are you?" },
        ],
      },
    ];
    expect(readingTimeFromBlocks(blocks).words).toBe(5);
  });

  it("returns zero words for null/undefined input", () => {
    expect(readingTimeFromBlocks(null).words).toBe(0);
    expect(readingTimeFromBlocks(undefined).words).toBe(0);
  });
});
