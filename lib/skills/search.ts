import * as v from "valibot";
import { enumParam } from "@/lib/search/enumParam";

/*
 * /skills route options that run on every navigation (so they ship in the
 * entry bundle): keep this module free of anything but Valibot. The skills
 * snapshot (lib/content/skills) is far too big to import here.
 */

/**
 * The catalog filters, as the canvas draws them: everything, by origin
 * (original or adapted), or by who invokes the skill (the agent or you).
 */
export const SKILL_FILTERS = [
  "all",
  "original",
  "adapted",
  "auto",
  "user",
] as const;
export type SkillFilter = (typeof SKILL_FILTERS)[number];

/** The default filter; stripped from the URL, so /skills stays clean. */
export const SKILLS_SEARCH_DEFAULTS = { show: "all" } as const;

/**
 * /skills search params (TanStack Router `validateSearch`, Standard Schema):
 * `?show=original|adapted|auto|user` narrows the catalog. A missing or
 * unknown value falls back to all skills without an error.
 */
export const skillsSearchSchema = v.object({
  show: enumParam(SKILL_FILTERS, SKILLS_SEARCH_DEFAULTS.show),
});

/** Whether a skill shows under `filter`. */
export function matchesSkillFilter(
  skill: { origin: "original" | "adapted"; userInvoked: boolean },
  filter: SkillFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "original":
    case "adapted":
      return skill.origin === filter;
    case "auto":
      return !skill.userInvoked;
    case "user":
      return skill.userInvoked;
  }
}
