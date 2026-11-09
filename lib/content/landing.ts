import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { PERSON_META_DESCRIPTION } from "@/lib/content/identityMeta";

export const site = {
  wordmark: "KunanonJ",
  contextLabel: "Bangkok 🇹🇭 · Founder",
  title: "Fronk Kunanon Jarat — Building fintech and AI from Bangkok.",
  description: PERSON_META_DESCRIPTION,
  email: "fronk.kunanon@gmail.com",
  tagline: "Building fintech and digital workspaces from Bangkok.",
} as const;

/** Icon keys for nav items (kept as stable ids for the nav content tests). */
export type NavIconId =
  | "about"
  | "ventures"
  | "portfolio"
  | "skills"
  | "library"
  | "blog"
  | "learn"
  | "examples"
  | "stack"
  | "proof"
  | "build";

export type NavChild = { label: string; href: string; icon?: NavIconId };

export type NavItem =
  | { type: "link"; label: string; href: string; icon?: NavIconId }
  | {
      type: "menu";
      label: string;
      /** Optional parent href (e.g. section deep-link). */
      href?: string;
      icon?: NavIconId;
      children: readonly NavChild[];
    };

/** Human library pages: the "Library" group of the site menu. */
export const footerLibrary = [
  { label: "Learn", href: "/learn", icon: "learn" },
  { label: "Examples", href: "/examples", icon: "examples" },
  { label: "Stack", href: "/stack", icon: "stack" },
  { label: "Proof", href: "/proof", icon: "proof" },
  { label: "Build", href: "/build", icon: "build" },
] as const satisfies readonly NavChild[];

/** Primary site sections: flat links + the Library group (site menu, bento redesign). */
export const primaryNav: readonly NavItem[] = [
  { type: "link", label: "About", href: "/about", icon: "about" },
  { type: "link", label: "Ventures", href: "/#ventures", icon: "ventures" },
  { type: "link", label: "Portfolio", href: "/portfolio", icon: "portfolio" },
  { type: "link", label: "Skills", href: "/skills", icon: "skills" },
  {
    type: "menu",
    label: "Library",
    icon: "library",
    children: footerLibrary.map((item) => ({
      label: item.label,
      href: item.href,
      icon: item.icon,
    })),
  },
  // Blog hidden 09-11-26 (owner request); flip BLOG_PUBLIC to restore it.
  ...(BLOG_PUBLIC
    ? [{ type: "link", label: "Blog", href: "/blog", icon: "blog" } as const]
    : []),
  // Press hidden 04-11-26 (owner request); /press stays reachable but noindex.
];

/** The site menu's closing call to action (canvas: "Contact me"). */
export const navCta = { label: "Contact me", href: "/contact" } as const;

/**
 * Site menu rows in canvas order (bento redesign, phase 7a): Home, the flat
 * primary links, then the Library group. `match` lists the path prefixes that
 * mark a row as the current page (a project marks Portfolio, a skill Skills,
 * a topic hub Learn, a venture Ventures).
 */
export const siteMenu = {
  rows: [
    { label: "Home", href: "/", match: [] as readonly string[] },
    ...primaryNav.flatMap((item) =>
      item.type === "link"
        ? [
            {
              label: item.label,
              href: item.href,
              match:
                item.href === "/#ventures"
                  ? (["/ventures/"] as readonly string[])
                  : ([`${item.href}/`] as readonly string[]),
            },
          ]
        : [],
    ),
  ],
  libraryLabel: "Library",
  library: footerLibrary.map((item) => ({
    label: item.label,
    href: item.href,
    match:
      item.href === "/learn"
        ? (["/topics/", "/th/topics/"] as readonly string[])
        : ([] as readonly string[]),
  })),
  cta: navCta,
} as const;

/** Home hero (visual-redesign Phase 2; statement chosen by the owner 09-11-26). */
export const hero = {
  wordmark: site.wordmark,
  eyebrow: "Kunanon Jarat (Fronk) · Bangkok",
  statement: "Building fintech and AI from Bangkok.",
  statementSecondary: "Founder of GoGoCash and Manut AI.",
  lead: "Cashback for shoppers, and an ERP/CRM workspace with Intelligence AI for automotive SMEs. Also IT Manager & AI Engineering Lead at The Binary Holdings.",
  primaryCta: { label: "Contact me", href: "/contact" },
  secondaryCta: { label: "See my work", href: "/portfolio" },
  /** Shown in a "live" chip: something that is genuinely in progress now. */
  status: "Building GoGoCash and Manut AI",
  /**
   * Bento Home h1 (canvas copy, owner-approved 09-11-26): "Hi, I'm [photo]
   * Kunanon Jarat. / Founder of GoGoCash and / Manut AI." The connector
   * words render muted; the last line in the accent colour.
   */
  greeting: "Hi, I’m",
  name: "Kunanon Jarat.",
  founderOf: "Founder of",
  ventureA: "GoGoCash",
  joiner: "and",
  ventureB: "Manut AI.",
  /** The canvas Home lead, next to the "Contact me" button. */
  homeLead:
    "Building fintech and AI from Bangkok. Also IT Manager & AI Engineering Lead at The Binary Holdings.",
  portraitSrc: "/profile-portrait.webp",
} as const;

/** "Based in Bangkok" card (canvas copy; the llms.txt intro says the same). */
export const place = {
  before: "Based in",
  city: "Bangkok",
  timeZone: "Asia/Bangkok",
  utcLabel: "GMT+7",
  body: "Building fintech and AI operator systems from Bangkok, for Thailand and SEA: AI transformation, ERP/CRM, internal systems, and tech startups.",
  cta: { label: "Say hello", href: "/contact" },
} as const;

/**
 * Home ventures. Two ventures only (owner, 09-11-26): GoGoCash and Manut AI.
 * Numbers here restate the published metrics in lib/content/ventures.ts.
 */
export const ventures = {
  eyebrow: "Ventures",
  heading: "Two ventures, built from Bangkok.",
  subheading: "Fintech for shoppers, and AI workspaces for automotive SMEs.",
  cards: [
    {
      number: "01",
      title: "GoGoCash",
      icon: "/brand/gogocash.svg",
      summary: "A shopping-to-earn cashback platform.",
      items: ["1,000+ users", "220+ merchants", "Up to 30% cashback"],
      href: "/ventures/gogocash",
      linkLabel: "GoGoCash case study",
    },
    {
      number: "02",
      title: "Manut AI",
      icon: "/brand/manut-144.webp",
      summary: "An ERP/CRM workspace with Intelligence AI for automotive SMEs.",
      items: ["ERP/CRM", "Intelligence AI", "Automotive SMEs"],
      href: "/ventures/manut",
      linkLabel: "Manut AI case study",
    },
  ],
} as const;

export const socials = [
  { label: "X", href: "https://x.com/fkj98" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/kunanonj" },
  { label: "GitHub", href: "https://github.com/KunanonJ" },
] as const;

/**
 * The footer's compact "For agents" row (owner, 09-11-26): the machine-
 * readable surfaces, labelled by file name. `/skills.md` is the coding guide
 * for agents working on this site, not the `/skills` catalog.
 */
export const footerAgents = {
  label: "For agents",
  links: [
    { label: "agents.md", href: "/agents.md" },
    { label: "llms.txt", href: "/llms.txt" },
    { label: "sitemap.md", href: "/sitemap.md" },
    { label: "skills.md", href: "/skills.md" },
  ],
} as const;
