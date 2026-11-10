import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { CONTACT_SEARCH_DEFAULTS, contactSearchSchema } from "./search";

describe("contact search params", () => {
  const parse = (input: unknown) => v.parse(contactSearchSchema, input);

  it("defaults to the general form", () => {
    expect(parse({})).toEqual({ topic: "general" });
    expect(CONTACT_SEARCH_DEFAULTS).toEqual({ topic: "general" });
  });

  it("reads ?topic=hiring", () => {
    expect(parse({ topic: "hiring" })).toEqual({ topic: "hiring" });
  });

  it.each([["Hiring"], ["recruiting"], [""], [1], [null], [["hiring"]]])(
    "falls back to general for %j without throwing",
    (topic) => {
      expect(parse({ topic })).toEqual({ topic: "general" });
    },
  );

  it("drops unrelated params", () => {
    expect(parse({ topic: "hiring", utm_source: "x" })).toEqual({
      topic: "hiring",
    });
  });
});
