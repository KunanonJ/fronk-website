import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { enumParam } from "./enumParam";

describe("enumParam", () => {
  const schema = v.object({
    view: enumParam(["detailed", "compact"], "detailed"),
  });

  it("keeps a known value", () => {
    expect(v.parse(schema, { view: "compact" })).toEqual({ view: "compact" });
  });

  it("falls back on a missing or unknown value without an error", () => {
    expect(v.parse(schema, {})).toEqual({ view: "detailed" });
    expect(v.parse(schema, { view: "nope" })).toEqual({ view: "detailed" });
    expect(v.parse(schema, { view: 3 })).toEqual({ view: "detailed" });
  });
});
