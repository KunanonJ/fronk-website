import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "./faq";

describe("FAQ_ITEMS > is non-empty and well-formed", () => {
  it("has at least five Q&A pairs, each with a question and an answer", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(5);
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim().length).toBeGreaterThan(0);
      expect(item.answer.trim().length).toBeGreaterThan(0);
    }
  });

  it("grounds the key entities so the schema reflects the real bio", () => {
    const corpus = FAQ_ITEMS.map((i) => `${i.question} ${i.answer}`).join(" ");
    expect(corpus).toContain("GoGoCash");
    expect(corpus).toContain("Manut AI");
    expect(corpus).toContain("Bangkok");
  });
});
