/**
 * Availability, as the owner directed on 20-11-26: he is building GoGoCash
 * and Manut AI from Bangkok and is not looking for a full-time role. He is
 * open to partnerships, freelance and consulting projects, advisory, talks
 * and workshops, and recruiters may still get in touch for later.
 * Relocation and travel are not offered, so nothing here suggests them.
 *
 * Its own small module: Home, About, the résumé, both FDE hubs, the case
 * studies and Contact show it, and none of them should pull in the whole
 * identity module for one line. lib/content/identity.ts re-exports it.
 */
export const AVAILABILITY = {
  ventures: ["GoGoCash", "Manut AI"],
  location: "Bangkok",
  // Owner direction 20-11-26: the sentence, the pill and workWith.
  sentence:
    "Currently building GoGoCash and Manut AI from Bangkok, and not looking for a full-time role right now.",
  /** What he is open to: shown where the hiring call to action used to explain itself. */
  workWith:
    "Open to partnerships, freelance and consulting projects, advisory, talks and workshops.",
  /** The availability pill: a short label, then the ventures and where. */
  pill: {
    label: "Currently building",
    detail: "GoGoCash and Manut AI · Bangkok",
  },
  /** The Thai hub's wording. Label and detail together open the sentence. */
  th: {
    sentence:
      "กำลังสร้าง GoGoCash และ Manut AI ที่กรุงเทพฯ และยังไม่ได้มองหางานประจำในตอนนี้",
    pill: {
      label: "กำลังสร้าง",
      detail: "GoGoCash และ Manut AI ที่กรุงเทพฯ",
    },
  },
} as const;

/**
 * Where a "Get in touch" or "Work with me" button leads: the contact form
 * with "Freelance or consulting" chosen.
 */
export const WORK_CONTACT_HREF = "/contact?topic=project";

/**
 * Where a recruiter's link leads: the contact form with "A future role"
 * chosen. `/contact?topic=hiring` is the address every older hiring button
 * used, so it stays valid.
 */
export const FUTURE_ROLE_CONTACT_HREF = "/contact?topic=hiring";

/** The résumé, for the buttons beside every Contact button. */
export const RESUME_HREF = "/resume";

/** The résumé as a file (`pnpm pdf` writes it). */
export const RESUME_PDF_HREF = "/resume.pdf";

/** The name a download saves under, so a recruiter can find the file again. */
export const RESUME_PDF_NAME = "Kunanon-Jarat-Resume.pdf";
