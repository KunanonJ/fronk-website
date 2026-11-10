import { site } from "@/lib/content/landing";
import { siteConfig } from "@/lib/site";
import { PAGE_META } from "@/lib/content/pageMeta";

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
  metaTitle: PAGE_META.contact.title,
  metaDescription: PAGE_META.contact.description,
  eyebrow: "Contact",
  /**
   * The page h1 in two lines (bento canvas): "Building in fintech, AI or
   * ops? / Let's talk." Muted words render in --muted, "talk." in the accent.
   */
  headline: {
    muted: "Building in",
    focus: "fintech, AI",
    joiner: "or",
    focusTail: "ops?",
    lead: "Let’s",
    accent: "talk.",
  },
  /** The hero lead restates the meta description. */
  lead: PAGE_META.contact.description,
  /** The form card's id: "Say hello" links on this page jump to it. */
  formId: "say-hello",
  cardTitle: "Say hello",
  directLabel: "Email me directly",
  email: site.email,
  copyEmail: "Copy email",
  emailCopied: "Copied",
  formLabel: "Or send a message",
  namePlaceholder: "Full name",
  emailPlaceholder: "Email",
  messagePlaceholder: "What are you working on, and how can I help?",
  topicsLabel: "What’s it about?",
  submit: "Send message",
  sending: "Sending...",
  successTitle: "Thanks, it’s in my inbox.",
  successBody: "I’ll reply by email.",
  sendAnother: "Send another message",
  errorFallbackLead: "You can also email me at",
  mailtoSubject: "Hello from kunanonj.com",
  elsewhereTitle: "Elsewhere",
  whoTitle: "Who should write",
} as const;

/** "Elsewhere" on /contact: every public profile, in the canvas order. */
export const contactElsewhere = [
  { label: "X", href: siteConfig.socials.x },
  { label: "LinkedIn", href: siteConfig.socials.linkedin },
  { label: "GitHub", href: siteConfig.socials.github },
  { label: "Telegram", href: siteConfig.socials.telegram },
  { label: "Farcaster", href: siteConfig.socials.farcaster },
] as const;

/** The "Who should write" card's links (canvas): About, Ventures, Résumé. */
export const contactNextLinks = [
  { label: "About", href: "/about" },
  { label: "Ventures", href: "/#ventures" },
  { label: "Résumé", href: "/resume" },
] as const;

export const contactMessages = {
  sent: "Thanks, it's in my inbox. I'll reply by email.",
  invalidName: "Add your name.",
  invalidEmail: "Enter a valid email address.",
  messageTooShort: `Write a little more (at least ${CONTACT_LIMITS.messageMin} characters).`,
  messageTooLong: `Keep it under ${CONTACT_LIMITS.messageMax.toLocaleString("en-US")} characters.`,
  notConfigured: "The contact form isn't connected yet.",
  failed: "That didn't send.",
  tooLarge: "That message is too long to send.",
  rateLimited:
    "Too many messages from this connection. Wait a minute and try again.",
  botCheck: "Your browser didn't pass the spam check. Try again.",
} as const;

export function isContactTopic(value: unknown): value is ContactTopic {
  return (
    typeof value === "string" &&
    (CONTACT_TOPICS as readonly string[]).includes(value)
  );
}
