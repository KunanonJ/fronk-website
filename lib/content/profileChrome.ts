import { OPEN_TO_ROLES, RESUME_HREF } from "@/lib/content/availability";
import { contactPage } from "@/lib/content/contact";
import { PERSON_NAME } from "@/lib/content/identity";
import {
  footerAgents,
  hero,
  navCta,
  place,
  site,
  siteMenu,
  socials,
} from "@/lib/content/landing";

/*
 * Copy and links of the profile redesign's chrome (Phase 1, design spec 7).
 * Components read from here and from the modules above; nothing is retyped
 * from the site's own content. Lines marked DRAFT wait for the owner's
 * approval (umbrella input R3) and are not final copy until he gives it.
 */

/**
 * Where the redesigned Home is served. The preview lives under /preview; the
 * Phase 6 cutover sets this to "" and every chrome link follows it.
 */
export const PROFILE_BASE = "/preview";

/** The Home page, or one of its sections: `homeHref("work")`. */
export function homeHref(section?: string): string {
  const home = PROFILE_BASE || "/";
  return section ? `${home}#${section}` : home;
}

/** The Home sections the nav follows with its scrollspy, in page order. */
export const HOME_SECTIONS = ["work", "about", "journey"] as const;

export interface ChromeLink {
  readonly label: string;
  readonly href: string;
  /** Paths that make this link the current page: exact, or a prefix ending "/". */
  readonly current: readonly string[];
  /** The Home section the link scrolls to, which the scrollspy follows. */
  readonly section?: (typeof HOME_SECTIONS)[number];
}

/** A link's address, read from a site menu row so it is typed once. */
function siteMenuHref(label: string): string {
  const row = siteMenu.rows.find((item) => item.label === label);
  if (!row) throw new Error(`The site menu has no row named "${label}".`);
  return row.href;
}

/** The pill nav's links (spec 7.1): Work, About, Journey and Résumé. */
export const profileNav: readonly ChromeLink[] = [
  {
    label: "Work",
    href: homeHref("work"),
    section: "work",
    current: [`${PROFILE_BASE}/portfolio/`, `${PROFILE_BASE}/ventures/`],
  },
  {
    label: "About",
    href: homeHref("about"),
    section: "about",
    current: [],
  },
  {
    label: "Journey",
    href: homeHref("journey"),
    section: "journey",
    current: [],
  },
  { label: "Résumé", href: RESUME_HREF, current: [RESUME_HREF] },
];

/**
 * The phone menu's links (spec 7.6, umbrella R1): the four above, then AI
 * engineering and Contact, which have no room in the pill.
 */
export const profileMenu: readonly ChromeLink[] = [
  ...profileNav,
  {
    label: "AI engineering",
    href: siteMenuHref("AI engineering"),
    current: [siteMenuHref("AI engineering")],
  },
  { label: "Contact", href: navCta.href, current: [navCta.href] },
];

/** Whether a link is the page the reader is on. */
export function isCurrentLink(link: ChromeLink, pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return link.current.some((prefix) =>
    prefix.endsWith("/") ? path.startsWith(prefix) : path === prefix,
  );
}

/**
 * The `aria-current` a chrome link carries, and the only source of it: "location"
 * for the Home section in view (spec 7.2), "page" for the page the reader is on.
 */
export function currentOf(
  link: ChromeLink,
  section: string | undefined,
  pathname: string,
): "location" | "page" | undefined {
  if (link.section !== undefined && link.section === section) return "location";
  return isCurrentLink(link, pathname) ? "page" : undefined;
}

/**
 * Every public page the old site menu links (spec 7.7). The footer lists them
 * from here, so the crawl path for crawlers that run no JavaScript survives.
 */
export const footerPages = [
  ...siteMenu.rows,
  ...siteMenu.library,
  siteMenu.cta,
].map(({ label, href }) => ({ label, href }));

const [FIRST_NAME = PERSON_NAME, ...SURNAME_WORDS] = PERSON_NAME.split(" ");

/** The brand in the nav's left pill. The surname stays in the link's name. */
export const brand = {
  firstName: FIRST_NAME,
  surname: SURNAME_WORDS.join(" "),
  label: `${PERSON_NAME}, home`,
  avatar: hero.portraitSrc,
  home: homeHref(),
};

/** The availability line and the place, as the footer card shows them. */
export const availability = {
  label: OPEN_TO_ROLES.pill.label,
  location: `${place.city}, ${place.utcLabel}`,
};

/** The copyright line, with the year passed in (spec 7.7). */
export function copyright(year: number): string {
  return `© ${year} ${PERSON_NAME} · ${place.city}`;
}

/*
 * DRAFT, awaiting the owner's approval (umbrella R3). Drafted from cleared
 * copy: place.body and OPEN_TO_ROLES.sentence in lib/content. First person,
 * with no figure or claim that the content does not already carry.
 */
export const footerCopy = {
  eyebrow: "Get in touch", // DRAFT
  headline: "Building something in AI or ops? Let’s talk.", // DRAFT
  paragraphs: [
    // DRAFT
    "I build fintech and AI operator systems from Bangkok, for Thailand and SEA: AI transformation, ERP/CRM, internal systems and tech startups.",
    // DRAFT, the emphasised last line
    "I’m open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote.",
  ],
} as const;

/** The footer's social links and its agent files, as lib/content gives them. */
export const footerLinks = {
  pages: "Pages",
  elsewhere: contactPage.elsewhereTitle,
  elsewhereLinks: socials,
  agents: footerAgents,
};

/** The Say hello popover (spec 7.4). Strings are the repo's where it has them. */
export const sayHello = {
  label: place.cta.label,
  // DRAFT, awaiting the owner's approval (umbrella R3, plan step 1c).
  eyebrow: "Email",
  address: site.email,
  name: `Email ${PERSON_NAME}`,
  copy: contactPage.copyEmail,
  copied: contactPage.emailCopied,
  compose: "Compose in Gmail",
  mailApp: "Open your mail app",
  contactForm: "Use the contact form",
  contactHref: navCta.href,
};

/** The Gmail compose address for the popover's second row. */
export function composeHref(address: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(address)}`;
}

/** The theme control's labels (spec 7.5). */
export const themeCopy = {
  toNight: "Switch to night mode",
  toDay: "Switch to day mode",
  legend: "Theme",
  light: "Light",
  dark: "Dark",
};

/** The phone menu's trigger and its names (spec 7.1, 7.6). */
export const menuCopy = {
  open: "Menu",
  close: "Close",
  openName: "Open menu",
  closeName: "Close menu",
  label: "Site",
};
