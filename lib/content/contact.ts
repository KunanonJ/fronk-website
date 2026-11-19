import {
  HIRING_CONTACT_HREF,
  RESUME_HREF,
  RESUME_PDF_HREF,
} from "@/lib/content/availability";
import { site } from "@/lib/content/landing";
import { siteConfig } from "@/lib/site";
import { PAGE_META } from "@/lib/content/pageMeta";

/**
 * Copy and limits for `/contact`. The form prepares an email that the
 * visitor's own email app sends (lib/contact/compose.ts): the site has no
 * mail server and keeps nothing.
 */

/** Hiring leads: it is the topic a recruiter looks for (recruiter-fit phase 2). */
export const CONTACT_TOPICS = [
  "Hiring",
  "GoGoCash",
  "Manut AI",
  "Partnership",
  "Investment",
  "AI / ERP advice",
  "Speaking or press",
  "Something else",
] as const;

/** The topic `/contact?topic=hiring` chooses for the visitor. */
export const HIRING_TOPIC = "Hiring" satisfies (typeof CONTACT_TOPICS)[number];

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const CONTACT_LIMITS = {
  nameMax: 100,
  messageMin: 10,
  messageMax: 5000,
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
  formLabel: "Or write it here",
  /** Under the button: what pressing it does, and that nothing is sent yet. */
  formNote:
    "It opens in your email app, addressed to me. Nothing is sent until you press Send there.",
  namePlaceholder: "Full name",
  messagePlaceholder: "What are you working on, and how can I help?",
  /** The message label when the visitor arrives through a hiring button. */
  hiringPlaceholder:
    "Tell me about the role: the team, the scope and the location",
  topicsLabel: "What’s it about?",
  submit: "Open in your email app",
  readyTitle: "Your email is ready.",
  readyBody:
    "Check it in your email app and press Send there. I reply to the address it comes from.",
  readyFallback: "Nothing opened? Copy the message and send it to",
  openAgain: "Open it again",
  /** When the message is too long for an email link (lib/contact/compose.ts). */
  longTitle: "Your message is ready to copy.",
  longBody:
    "It is too long to hand to your email app in one go. Copy it first, then open your email app: the address and subject are filled in, and you paste the message.",
  longFallback: "It goes to",
  openApp: "Open your email app",
  copyMessage: "Copy message",
  messageCopied: "Copied",
  /** Labels the selected email shown when the browser refuses the copy. */
  copyFailed:
    "Your browser blocked the copy. The email is selected below, ready to copy.",
  writeAnother: "Write another message",
  mailtoSubject: "Hello from kunanonj.com",
  elsewhereTitle: "Elsewhere",
  whoTitle: "Who should write",
  recruiterTitle: "For recruiters",
} as const;

/**
 * A link in the recruiter block: a page on the site, the résumé file
 * (`download`) or a profile on another site (`external`).
 */
export type RecruiterLink = {
  readonly label: string;
  readonly href: string;
  readonly download?: true;
  readonly external?: true;
};

const RESUME_FILE: RecruiterLink = {
  label: "Download PDF",
  href: RESUME_PDF_HREF,
  download: true,
};

const LINKEDIN: RecruiterLink = {
  label: "LinkedIn",
  href: siteConfig.socials.linkedin,
  external: true,
};

/** The "For recruiters" card's links: the résumé on screen, as a file, and LinkedIn. */
export const contactRecruiterLinks: readonly RecruiterLink[] = [
  { label: "Résumé", href: RESUME_HREF },
  RESUME_FILE,
  LINKEDIN,
];

/**
 * The same block in About's "Let's talk" card. The résumé already has a
 * button there, so the hiring form leads instead.
 */
export const aboutRecruiterLinks: readonly RecruiterLink[] = [
  { label: "Contact about a role", href: HIRING_CONTACT_HREF },
  RESUME_FILE,
  LINKEDIN,
];

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
  invalidName: "Add your name.",
  messageTooShort: `Write a little more (at least ${CONTACT_LIMITS.messageMin} characters).`,
  messageTooLong: `Keep it under ${CONTACT_LIMITS.messageMax.toLocaleString("en-US")} characters.`,
} as const;

export function isContactTopic(value: unknown): value is ContactTopic {
  return (
    typeof value === "string" &&
    (CONTACT_TOPICS as readonly string[]).includes(value)
  );
}
