/**
 * Availability, as approved by the owner on 10-11-26: open to Forward
 * Deployed Engineer and AI engineering roles, based in Bangkok or remote.
 * Relocation and travel are not offered, so nothing here suggests them.
 *
 * Its own small module: Home, About, the résumé, both FDE hubs, the case
 * studies and Contact show it, and none of them should pull in the whole
 * identity module for one line. lib/content/identity.ts re-exports it.
 */
export const OPEN_TO_ROLES = {
  roles: ["Forward Deployed Engineer", "AI engineering"],
  location: "Bangkok or remote",
  sentence:
    "Open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote.",
  /** The availability pill: a short label, then the roles and where. */
  pill: {
    label: "Open to roles",
    detail: "Forward Deployed Engineer and AI engineering · Bangkok or remote",
  },
  /** The Thai hub's wording. Label and detail together are the sentence. */
  th: {
    sentence:
      "เปิดรับตำแหน่ง Forward Deployed Engineer และงานวิศวกรรม AI ในกรุงเทพฯ หรือทำงานทางไกล",
    pill: {
      label: "เปิดรับตำแหน่ง",
      detail:
        "Forward Deployed Engineer และงานวิศวกรรม AI ในกรุงเทพฯ หรือทำงานทางไกล",
    },
  },
} as const;

/** Where a recruiter's button leads: the contact form with Hiring chosen. */
export const HIRING_CONTACT_HREF = "/contact?topic=hiring";

/** The résumé, for the buttons beside every Contact button. */
export const RESUME_HREF = "/resume";

/** The résumé as a file (`pnpm pdf` writes it). */
export const RESUME_PDF_HREF = "/resume.pdf";

/** The name a download saves under, so a recruiter can find the file again. */
export const RESUME_PDF_NAME = "Kunanon-Jarat-Resume.pdf";
