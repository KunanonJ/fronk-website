/**
 * Who Kunanon Jarat is, in one place. JSON-LD, the /about who-is block, the
 * FAQ, llms.txt and the agent docs all read from here, so search and answer
 * engines see one consistent identity.
 *
 * Every statement is drawn from repo content (the resume fallback, ventures,
 * portfolio) or from owner answers recorded on 10-11-26:
 *   - open to Forward Deployed Engineer and AI engineering roles, Bangkok or remote;
 *   - "Solopreneur" for how he builds products end to end;
 *   - customer-facing work may be stated in general terms (no names or counts).
 * Never add a claim here that the repo or the owner has not provided.
 */

import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { CURRENT_ROLE } from "@/lib/content/currentRole";

export { CURRENT_ROLE };

export const PERSON_NAME = "Kunanon Jarat";

/** Names people and AI engines use for him. */
export const PERSON_ALTERNATE_NAMES = [
  "Fronk",
  "KunanonJ",
  "Fronk Kunanon Jarat",
] as const;

/** Short headline for profile cards and agent docs. */
export const PERSON_HEADLINE =
  "AI Engineering Lead and solopreneur in Bangkok: builds AI tools inside the businesses that use them.";

/**
 * The canonical who-is summary (about 60 words). Leads with the AI role, then
 * the ventures; the Manut wording is the owner-confirmed one.
 */
export const PERSON_SUMMARY = `Kunanon Jarat (Fronk / KunanonJ) is a Bangkok-based AI engineering lead and solopreneur. As ${CURRENT_ROLE.title} at ${CURRENT_ROLE.organization} since ${CURRENT_ROLE.since}, he leads internal AI agents, automations and the intranet's AI assistant. He founded GoGoCash, a shopping-to-earn cashback platform, in 2023 and builds Manut AI, an ERP/CRM workspace with Intelligence AI for automotive SMEs.`;

/** How he works with the people who use what he builds (owner-confirmed, general terms only). */
export const PERSON_CUSTOMER_WORK =
  "He works directly with the people who use what he builds: Manut AI customers, GoGoCash merchant partners, and the companies he has run client projects and workshops for.";

/** The solopreneur framing, grounded in the venture copy in lib/content/ventures.ts. */
export const PERSON_SOLOPRENEUR =
  "He works as a solopreneur: he owns GoGoCash end to end, from merchant partnerships to the cashback engine, and designs and builds Manut AI himself, from the ERP/CRM structure to its AI workflows.";

/** Availability, as approved by the owner (lib/content/availability.ts). */
export { OPEN_TO_ROLES };

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
