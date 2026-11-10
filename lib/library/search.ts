import * as v from "valibot";
import { enumParam } from "@/lib/search/enumParam";

/*
 * Search params for the library pages (bento redesign, phase 7f; design spec
 * 4.10-4.14). Route options run on every navigation, so they ship in the
 * entry bundle: keep this module free of anything but Valibot. The content
 * modules import the ids from here, never the other way round.
 *
 * Every param falls back to its default when it is missing or unknown, and
 * the default is stripped from the URL (`stripSearchParams`), so /learn,
 * /examples, /stack and /build stay clean until a filter is picked.
 */

/** /learn: the language the topic hubs are shown in. */
export const LEARN_LANGS = ["en", "th"] as const;
export type LearnLang = (typeof LEARN_LANGS)[number];
export const LEARN_SEARCH_DEFAULTS = { lang: "en" } as const;
export const learnSearchSchema = v.object({
  lang: enumParam(LEARN_LANGS, LEARN_SEARCH_DEFAULTS.lang),
});

/** /examples: whose examples are shown. */
export const EXAMPLE_PERSONA_IDS = [
  "builders",
  "operators",
  "founders",
] as const;
export type ExamplePersonaId = (typeof EXAMPLE_PERSONA_IDS)[number];
export const EXAMPLES_SEARCH_DEFAULTS = { persona: "builders" } as const;
export const examplesSearchSchema = v.object({
  persona: enumParam(EXAMPLE_PERSONA_IDS, EXAMPLES_SEARCH_DEFAULTS.persona),
});

/** /stack: one tool group, or all of them. */
export const STACK_GROUP_IDS = ["build", "ship", "operate"] as const;
export type StackGroupId = (typeof STACK_GROUP_IDS)[number];
export type StackFilter = "all" | StackGroupId;
export const STACK_SEARCH_DEFAULTS = { group: "all" } as const;
export const stackSearchSchema = v.object({
  group: enumParam(["all", ...STACK_GROUP_IDS], STACK_SEARCH_DEFAULTS.group),
});

/** /build: one venture's tickets, or the whole board. */
export const BUILD_VENTURE_IDS = ["site", "gogocash", "manut"] as const;
export type BuildVentureId = (typeof BUILD_VENTURE_IDS)[number];
export type BuildFilter = "all" | BuildVentureId;
export const BUILD_SEARCH_DEFAULTS = { venture: "all" } as const;
export const buildSearchSchema = v.object({
  venture: enumParam(
    ["all", ...BUILD_VENTURE_IDS],
    BUILD_SEARCH_DEFAULTS.venture,
  ),
});
