import { AVAILABILITY, RESUME_HREF } from "@/lib/content/availability";
import { CONTACT_WORDS } from "@/lib/content/contactWords";
import { PERSON_NAME } from "@/lib/content/identity";
import { keepNamesWhole } from "@/lib/content/keepWhole";
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
 * from the site's own content. The owner approved this copy as is on
 * 21-11-26 (umbrella input R3).
 */

/** The Home page, or one of its sections: `homeHref("work")`. */
export function homeHref(section?: string): string {
  return section ? `/#${section}` : "/";
}

/** A case study's address: `caseHref("ventures", "gogocash")`. */
export function caseHref(kind: "portfolio" | "ventures", slug: string): string {
  return `/${kind}/${slug}`;
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
    // The portfolio index and every case page (spec 7.2).
    current: ["/portfolio", "/portfolio/", "/ventures/"],
  },
  {
    label: "About",
    href: homeHref("about"),
    section: "about",
    // The About page as well as Home's section (spec 7.2).
    current: ["/about"],
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

/**
 * A path as the router reads it, so the chrome compares the page it serves:
 * no trailing slash (the same page), and its fixed words in lower case, as
 * the router matches them in any case (TanStack Router's default,
 * `caseSensitive: false`): /Contact and /CONTACT are the contact page. A
 * slug keeps its case, as the pages look it up as written:
 * /topics/Forward-Deployed-AI-Engineering is a not-found page. Every page
 * two or more words deep ends in its slug (a test holds the routes to that).
 */
function routePath(pathname: string): string {
  const words = (pathname.replace(/\/+$/, "") || "/").split("/");
  const slug = words.length > 2 ? words.pop() : undefined;
  const fixed = words.join("/").toLowerCase();
  return slug === undefined ? fixed : `${fixed}/${slug}`;
}

/**
 * Whether a link is the page the reader is on, or that page's section parent
 * (spec 7.2). A Thai hub (/th/topics/...) counts as its English twin, as the
 * old site menu's rows did: no chrome link goes to /th, so the Thai FDE hub
 * marks "AI engineering" as the English one does. Only hubs live under /th;
 * anything else there is a not-found page and marks nothing.
 *
 * The other hubs mark no link (decided at the Phase 6 review, finding 3):
 * their section parent was the old menu's Learn row, and spec 7.1 and 7.6 give
 * the chrome no Learn link. The footer lists Learn but is the same on every
 * page (spec 7.7), so it marks only the exact page, through the router.
 */
export function isCurrentLink(link: ChromeLink, pathname: string): boolean {
  const path = routePath(pathname).replace(/^\/th(?=\/topics\/)/, "");
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
  label: AVAILABILITY.pill.label,
  location: `${place.city}, ${place.utcLabel}`,
  /** The place's clock, which the footer shows once the page runs. */
  timeZone: place.timeZone,
};

/**
 * The footer's "Now" line (premium interactions, item 7): what he is doing,
 * in the words that open /about's "What I'm doing now." (a test keeps the
 * two together), then the time in Bangkok.
 */
export const nowLine = {
  label: "Now:",
  doing: "building GoGoCash and Manut AI", // Owner direction 20-11-26.
};

/** The copyright line, with the year passed in (spec 7.7). */
export function copyright(year: number): string {
  return `© ${year} ${PERSON_NAME} · ${place.city}`;
}

/*
 * The owner approved this copy as is on 21-11-26 (umbrella R3). Drafted
 * from cleared copy: place.body, and AVAILABILITY.sentence and workWith in
 * lib/content (owner direction 20-11-26). First person, with no figure or
 * claim that the content does not already carry.
 */
export const footerCopy = {
  eyebrow: "Get in touch",
  headline: "Building something in AI or ops? Let’s talk.",
  paragraphs: [
    "I build fintech and AI operator systems from Bangkok, for Thailand and SEA: AI transformation, ERP/CRM, internal systems and tech startups.",
    // Owner direction 20-11-26: the emphasised last line; the name
    // unbroken on phones (keepWhole.ts).
    keepNamesWhole(
      "I’m building GoGoCash and Manut AI and not looking for a full-time role right now. I’m open to partnerships, freelance and consulting projects, advisory, talks and workshops.",
    ),
  ],
} as const;

/**
 * Whether the footer opens with its call to action, footerCopy and Say
 * hello (spec 7.7): on every page but /contact, which is that call to
 * action itself (UX sweep 21-11-26), however its address is written:
 * /contact/ and /Contact are that page too (routePath).
 */
export function footerInvites(pathname: string): boolean {
  return routePath(pathname) !== navCta.href;
}

/** The footer's social links and its agent files, as lib/content gives them. */
export const footerLinks = {
  pages: "Pages",
  elsewhere: CONTACT_WORDS.elsewhereTitle,
  elsewhereLinks: socials,
  agents: footerAgents,
};

/** The Say hello popover (spec 7.4). Strings are the repo's where it has them. */
export const sayHello = {
  label: place.cta.label,
  eyebrow: "Email",
  address: site.email,
  name: `Email ${PERSON_NAME}`,
  copy: CONTACT_WORDS.copyEmail,
  copied: CONTACT_WORDS.emailCopied,
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
/** The search dialog and its buttons (premium interactions, item 8). */
export const searchCopy = {
  open: "Search the site",
  shortcut: "⌘K",
  menu: "Search",
  placeholder: "Pages, cases, skills",
  close: "Close search",
  closeKey: "esc",
  groups: {
    page: "Pages",
    case: "Case studies",
    topic: "Topics",
    skill: "Agent skills",
  },
  loading: "Loading the index…",
  failed: "Search could not load. Try again in a moment.",
  empty: (query: string) => `Nothing matches “${query}”.`,
  hints: ["↑ ↓ to move", "↵ to open", "esc to close", "Type / for commands"],
  count: (n: number) => `${n} ${n === 1 ? "result" : "results"}`,
} as const;

export const menuCopy = {
  open: "Menu",
  close: "Close",
  openName: "Open menu",
  closeName: "Close menu",
  label: "Site",
};
