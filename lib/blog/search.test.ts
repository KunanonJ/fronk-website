import { describe, expect, it } from "vitest";
import * as v from "valibot";
import { blogSearchSchema } from "./search";

describe("blog search params", () => {
  const parse = (input: unknown) => v.parse(blogSearchSchema, input);

  it("defaults to no tag and no query", () => {
    expect(parse({})).toEqual({ tag: "", q: "" });
  });

  it("reads ?tag= and ?q=", () => {
    expect(parse({ tag: "AI", q: "erp crm" })).toEqual({
      tag: "AI",
      q: "erp crm",
    });
  });

  it("keeps a numeric query as text (the router parses ?q=2026 as a number)", () => {
    expect(parse({ q: 2026 })).toEqual({ tag: "", q: "2026" });
  });

  it.each([[null], [true], [["AI"]], [{ a: 1 }], ["x".repeat(81)]])(
    "falls back to empty for %j without throwing",
    (value) => {
      expect(parse({ tag: value, q: value })).toEqual({ tag: "", q: "" });
    },
  );

  it("drops unrelated params", () => {
    expect(parse({ tag: "SME", page: 2 })).toEqual({ tag: "SME", q: "" });
  });
});
