import { site } from "@/lib/content/landing";

/**
 * Copy and limits for `/contact`. Shared by the form (client) and
 * `/api/contact` (server) so the topic whitelist and length limits can't drift.
 */

export const CONTACT_TOPICS = [
  "GoGoCash",
  "Manut AI",
  "Partnership",
  "Investment",
  "AI / ERP advice",
  "Speaking or press",
  "Hiring",
  "Something else",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_LIMITS = {
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 5000,
  topicsMax: CONTACT_TOPICS.length,
  /** Submits faster than this after the form mounts are treated as bots. */
  minFillMs: 3000,
  /** Request bodies above this are rejected before parsing. */
  maxBodyBytes: 20_000,
} as const;

export const contactPage = {
  metaTitle: "Contact",
  metaDescription:
    "Email Kunanon Jarat (Fronk) or send a message about fintech, AI, ERP/CRM or startups in Bangkok and Southeast Asia.",
  headlineLead: "Building in fintech, AI or ops?",
  headlineTail: "Let's",
  headlineAccent: "talk.",
  cardTitle: "Say hello",
  directLabel: "Email me directly",
  email: site.email,
  divider: "or",
  formLabel: "Or send a message",
  namePlaceholder: "Full name",
  emailPlaceholder: "Email",
  messagePlaceholder: "What are you working on, and how can I help?",
  topicsLabel: "What's it about?",
  submit: "Send message",
  sending: "Sending...",
  successTitle: "Thanks, it's in my inbox.",
  successBody: "I'll reply by email.",
  errorFallbackLead: "You can also email me at",
  mailtoSubject: "Hello from kunanonj.com",
} as const;

export const contactMessages = {
  sent: "Thanks, it's in my inbox. I'll reply by email.",
  invalidName: "Add your name.",
  invalidEmail: "Enter a valid email address.",
  messageTooShort: `Write a little more (at least ${CONTACT_LIMITS.messageMin} characters).`,
  messageTooLong: `Keep it under ${CONTACT_LIMITS.messageMax.toLocaleString("en-US")} characters.`,
  notConfigured: "The contact form isn't connected yet.",
  failed: "That didn't send.",
  tooLarge: "That message is too long to send.",
} as const;

export function isContactTopic(value: unknown): value is ContactTopic {
  return (
    typeof value === "string" &&
    (CONTACT_TOPICS as readonly string[]).includes(value)
  );
}
