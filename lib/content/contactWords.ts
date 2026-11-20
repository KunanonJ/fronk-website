/**
 * The few words the contact page shares with the footer on every page.
 * They live here, not in contact.ts, so the footer does not bring the whole
 * contact page's copy into every page's first load; contact.ts reads them
 * from here, so both say the same.
 */
export const CONTACT_WORDS = {
  copyEmail: "Copy email",
  emailCopied: "Copied",
  elsewhereTitle: "Elsewhere",
} as const;
