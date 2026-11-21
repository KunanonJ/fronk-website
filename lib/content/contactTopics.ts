import type { ContactIntent } from "@/lib/contact/search";
import { contactPage } from "@/lib/content/contact";

/*
 * The contact form's topics and what each one asks. Only the form, its
 * schema and the agents' tools read them, so they live apart from
 * ./contact, which the footer on every page loads.
 */

/**
 * The topics, in the order the owner directed on 20-11-26: the work the
 * owner is open to first, a future role near the end (they are not looking
 * now, but recruiters may write for later).
 */
export const CONTACT_TOPICS = [
  "Freelance or consulting",
  "Partnership",
  "GoGoCash",
  "Manut AI",
  "AI / ERP advice",
  "Speaking or workshops",
  "Investment",
  "A future role",
  "Something else",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

/**
 * The topic each `?topic=` intent chooses for the visitor: `project` (the
 * "Get in touch" and "Work with me" buttons) and `hiring` (a recruiter's
 * link, and every older hiring button).
 */
export const INTENT_TOPICS = {
  project: "Freelance or consulting",
  hiring: "A future role",
} as const satisfies Record<Exclude<ContactIntent, "general">, ContactTopic>;

/**
 * The message label while one of these topics is chosen (the first chosen
 * wins): what that visitor should say (owner direction 20-11-26).
 */
export const TOPIC_PROMPTS = {
  "Freelance or consulting": "What are you building, and where could I help?",
  "A future role":
    "Not looking right now, but tell me about the role for later: the team and the scope",
} as const satisfies Partial<Record<ContactTopic, string>>;

/** The message label for these chosen topics: the first one with a prompt. */
export function messagePrompt(topics: readonly string[]): string {
  const prompts: Readonly<Record<string, string>> = TOPIC_PROMPTS;
  const topic = topics.find((t) => Object.hasOwn(prompts, t));
  return topic ? prompts[topic]! : contactPage.messagePlaceholder;
}

export function isContactTopic(value: unknown): value is ContactTopic {
  return (
    typeof value === "string" &&
    (CONTACT_TOPICS as readonly string[]).includes(value)
  );
}
