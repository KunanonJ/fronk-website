import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "./faq";
import { getAllSkills } from "./skills";

/** FAQ answers that quote numbers must match the data they describe. */
describe("FAQ facts", () => {
  it("states the Superstacks counts the snapshot holds", () => {
    const answer = FAQ_ITEMS.find(
      (f) => f.question === "What is Superstacks?",
    )!.answer;
    const skills = getAllSkills();
    const original = skills.filter((s) => s.origin === "original").length;
    const adapted = skills.length - original;
    const words = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
    ];
    expect(answer).toContain(`pack of ${skills.length} agent skills`);
    expect(answer.toLowerCase()).toContain(`${words[original]} are original`);
    expect(answer.toLowerCase()).toContain(`${words[adapted]} are adapted`);
  });
});
