import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";

export const site = {
  wordmark: "KunanonJ",
  contextLabel: "Bangkok 🇹🇭 · Founder",
  title: "Fronk Kunanon Jarat — Building fintech and AI from Bangkok.",
  description:
    "Personal site of Kunanon Jarat (Fronk) — founder of GoGoCash, building fintech and adjacent infrastructure from Bangkok.",
  email: "fronk.kunanon@gmail.com",
  tagline: "Building fintech and digital workspaces from Bangkok.",
} as const;

/** Icon keys for nav items; mapped to lucide icons in `LandingTopNav`. */
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

/** Human library pages (creed-style secondary IA) — home footer + Library nav menu */
export const footerLibrary = [
  { label: "Learn", href: "/learn", icon: "learn" },
  { label: "Examples", href: "/examples", icon: "examples" },
  { label: "Stack", href: "/stack", icon: "stack" },
  { label: "Proof", href: "/proof", icon: "proof" },
  { label: "Build", href: "/build", icon: "build" },
] as const satisfies readonly NavChild[];

/** Primary chrome items (creed-style pill). Flat links + Library menu + Contact CTA. */
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

export const navCta = { label: "Contact", href: "/contact" } as const;


/** Operator keyword tips (hpbrn-style) for home about / about page. */
export const aboutKeywords = [
  { text: "Bangkok", tip: "Base of operations — Thailand first, SEA next" },
  { text: "GoGoCash", tip: "Shopping-to-earn cashback · 1,000+ users" },
  { text: "Manut", tip: "ERP/CRM + Intelligence AI for automotive SMEs" },
  { text: "ERP/CRM", tip: "Internal systems before agent theater" },
] as const;

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
} as const;

/** Home "About" section. */
export const about = {
  label: "About",
  heading: "I'm Kunanon Jarat, a founder and operator in Bangkok.",
  body: "Founder of GoGoCash and Manut AI: cashback for shoppers, and an ERP/CRM workspace with Intelligence AI for SMEs in the automotive industry. Also IT Manager & AI Engineering Lead at The Binary Holdings.",
  ctaLabel: "More about me",
  ctaHref: "/about",
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

/** Footer "Work" column (visual-redesign Phase 1). */
export const footerWork = [
  { label: "About", href: "/about" },
  { label: "Ventures", href: "/#ventures" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Skills", href: "/skills" },
] as const;

/** Machine-readable / agent surfaces linked from the home footer */
export const footerResources = [
  { label: "Agents", href: "/agents.md" },
  { label: "sitemap.md", href: "/sitemap.md" },
  { label: "llms.txt", href: "/llms.txt" },
  // `/skills.md` is the coding guide for agents working on this site, not the
  // `/skills` catalog, so it is labelled to keep the two apart.
  { label: "Agent guide", href: "/skills.md" },
  // The RSS feed only carries blog posts, so it's listed only while the blog is public.
  ...(BLOG_PUBLIC ? [{ label: "feed.xml", href: "/feed.xml" } as const] : []),
] as const;

export const contact = {
  label: "Contact",
  email: site.email,
  tagline: site.tagline,
  ctaLabel: "Contact Me",
  ctaHref: "/contact",
} as const;
