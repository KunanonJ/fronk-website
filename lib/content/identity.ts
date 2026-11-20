/**
 * Who Kunanon Jarat is, in one place. JSON-LD, the /about who-is block, the
 * FAQ, llms.txt and the agent docs all read from here, so search and answer
 * engines see one consistent identity.
 *
 * Every statement is drawn from repo content (the resume fallback, ventures,
 * portfolio) or from owner answers recorded on 10-11-26 and 20-11-26:
 *   - "Solopreneur" for how he builds products end to end;
 *   - customer-facing work may be stated in general terms (no names or counts);
 *   - (20-11-26) his role at The Binary Holdings ended in November 2026; he
 *     is building GoGoCash and Manut AI and is not looking for a full-time
 *     role (lib/content/availability.ts).
 * Never add a claim here that the repo or the owner has not provided.
 */

import { AVAILABILITY } from "@/lib/content/availability";
import { LATEST_ROLE } from "@/lib/content/currentRole";

export { LATEST_ROLE };

export const PERSON_NAME = "Kunanon Jarat";

/** Names people and AI engines use for him. */
export const PERSON_ALTERNATE_NAMES = [
  "Fronk",
  "KunanonJ",
  "Fronk Kunanon Jarat",
] as const;

/**
 * Short headline for profile cards and agent docs. DRAFT (owner direction
 * 20-11-26): the ventures now, then the role that ended.
 */
export const PERSON_HEADLINE =
  "Solopreneur in Bangkok building GoGoCash and Manut AI. Previously AI Engineering Lead at The Binary Holdings.";

/**
 * The canonical who-is summary (about 60 words). Leads with the ventures he
 * is building, then the role that ended (owner direction 20-11-26); the
 * Manut wording is the owner-confirmed one.
 */
export const PERSON_SUMMARY = `Kunanon Jarat (Fronk / KunanonJ) is a Bangkok-based solopreneur. He founded GoGoCash, a shopping-to-earn cashback platform, in 2023 and builds Manut AI, an ERP/CRM workspace with Intelligence AI for automotive SMEs. He was ${LATEST_ROLE.title} at ${LATEST_ROLE.organization} from ${LATEST_ROLE.since} to ${LATEST_ROLE.until}, where he led internal AI agents, automations and the intranet's AI assistant.`;

/** How he works with the people who use what he builds (owner-confirmed, general terms only). */
export const PERSON_CUSTOMER_WORK =
  "He works directly with the people who use what he builds: Manut AI customers, GoGoCash merchant partners, and the companies he has run client projects and workshops for.";

/** The solopreneur framing, grounded in the venture copy in lib/content/ventures.ts. */
export const PERSON_SOLOPRENEUR =
  "He works as a solopreneur: he owns GoGoCash end to end, from merchant partnerships to the cashback engine, and designs and builds Manut AI himself, from the ERP/CRM structure to its AI workflows.";

/** Availability, as the owner directed (lib/content/availability.ts). */
export { AVAILABILITY };

/** Education and memberships for Person.alumniOf / Person.memberOf (from the resume). */
export const PERSON_ALUMNI_OF = {
  name: "Kasetsart University",
  url: "https://ku.ac.th",
} as const;

export const PERSON_MEMBER_OF = {
  name: "Bangkok Startup Association",
  url: "https://bsa.or.th",
} as const;

/**
 * Person.knowsAbout: topics the site covers plus skills shown in the
 * portfolio, ventures and skills pages. Only evidenced terms.
 */
export const PERSON_KNOWS_ABOUT = [
  "AI engineering",
  "AI agents",
  "LLM integration",
  "Human-in-the-loop automation",
  "Google Agent Development Kit",
  "Gemini",
  "Claude",
  "Agent skills for coding agents",
  "Internal tools",
  "ERP CRM internal systems",
  "AI transformation Thailand",
  "Full-stack TypeScript",
  "Cloudflare Workers",
  "Fintech",
  "Tech startups Southeast Asia",
] as const;
