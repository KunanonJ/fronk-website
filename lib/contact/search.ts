import * as v from "valibot";
import { enumParam } from "@/lib/search/enumParam";

/*
 * /contact route options that run on every navigation (so they ship in the
 * entry bundle): keep this module free of anything but Valibot.
 */

/** Why the visitor came: `hiring` opens the form with the Hiring topic chosen. */
export const CONTACT_INTENTS = ["general", "hiring"] as const;
export type ContactIntent = (typeof CONTACT_INTENTS)[number];

/** The default intent; stripped from the URL, so /contact stays clean. */
export const CONTACT_SEARCH_DEFAULTS = { topic: "general" } as const;

/**
 * /contact search params (TanStack Router `validateSearch`, Standard Schema):
 * `?topic=hiring` is where every recruiter button leads. A missing or
 * unknown value falls back to the general form without an error.
 */
export const contactSearchSchema = v.object({
  topic: enumParam(CONTACT_INTENTS, CONTACT_SEARCH_DEFAULTS.topic),
});
