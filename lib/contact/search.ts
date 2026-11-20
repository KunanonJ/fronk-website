import * as v from "valibot";
import { enumParam } from "@/lib/search/enumParam";

/*
 * /contact route options that run on every navigation (so they ship in the
 * entry bundle): keep this module free of anything but Valibot.
 */

/**
 * Why the visitor came: `project` opens the form with "Freelance or
 * consulting" chosen, `hiring` with "A future role" (INTENT_TOPICS in
 * lib/content/contactTopics.ts).
 */
const CONTACT_INTENTS = ["general", "project", "hiring"] as const;
export type ContactIntent = (typeof CONTACT_INTENTS)[number];

/** The default intent; stripped from the URL, so /contact stays clean. */
export const CONTACT_SEARCH_DEFAULTS = { topic: "general" } as const;

/**
 * /contact search params (TanStack Router `validateSearch`, Standard Schema):
 * `?topic=project` is where every "Get in touch" and "Work with me" button
 * leads; `?topic=hiring`, where a recruiter's link and every older hiring
 * button lead, stays valid. A missing or unknown value falls back to the
 * general form without an error.
 */
export const contactSearchSchema = v.object({
  topic: enumParam(CONTACT_INTENTS, CONTACT_SEARCH_DEFAULTS.topic),
});
