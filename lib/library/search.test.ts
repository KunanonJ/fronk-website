import { describe, expect, it } from "vitest";
import * as v from "valibot";
import {
  BUILD_SEARCH_DEFAULTS,
  BUILD_VENTURE_IDS,
  EXAMPLE_PERSONA_IDS,
  EXAMPLES_SEARCH_DEFAULTS,
  LEARN_LANGS,
  LEARN_SEARCH_DEFAULTS,
  STACK_GROUP_IDS,
  STACK_SEARCH_DEFAULTS,
  buildSearchSchema,
  examplesSearchSchema,
  learnSearchSchema,
  stackSearchSchema,
} from "./search";

/** Junk a hand-edited or stale URL can carry. */
const JUNK = [["Ship"], ["everything"], [""], [1], [null], [["th"]]] as const;

const CASES = [
  {
    name: "learn ?lang=",
    schema: learnSearchSchema,
    key: "lang",
    values: LEARN_LANGS,
    defaults: LEARN_SEARCH_DEFAULTS,
  },
  {
    name: "examples ?persona=",
    schema: examplesSearchSchema,
    key: "persona",
    values: EXAMPLE_PERSONA_IDS,
    defaults: EXAMPLES_SEARCH_DEFAULTS,
  },
  {
    name: "stack ?group=",
    schema: stackSearchSchema,
    key: "group",
    values: ["all", ...STACK_GROUP_IDS],
    defaults: STACK_SEARCH_DEFAULTS,
  },
  {
    name: "build ?venture=",
    schema: buildSearchSchema,
    key: "venture",
    values: ["all", ...BUILD_VENTURE_IDS],
    defaults: BUILD_SEARCH_DEFAULTS,
  },
] as const;

describe.each(CASES)("$name", ({ schema, key, values, defaults }) => {
  const parse = (input: unknown) => v.parse(schema, input);

  it("defaults when the param is missing", () => {
    expect(parse({})).toEqual(defaults);
  });

  it.each(values.map((value) => [value]))("reads %s", (value) => {
    expect(parse({ [key]: value })).toEqual({ [key]: value });
  });

  it.each(JUNK)(
    "falls back to the default for %j without throwing",
    (value) => {
      expect(parse({ [key]: value })).toEqual(defaults);
    },
  );

  it("drops unrelated params", () => {
    expect(parse({ [key]: values[1], show: "user" })).toEqual({
      [key]: values[1],
    });
  });
});
