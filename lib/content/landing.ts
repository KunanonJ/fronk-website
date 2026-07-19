export const site = {
  wordmark: "KunanonJ",
  contextLabel: "Bangkok 🇹🇭 · Founder",
  title: "Fronk Kunanon Jarat — Building fintech and AI from Bangkok.",
  description:
    "Personal site of Kunanon Jarat (Fronk) — founder of GoGoCash, building fintech and adjacent infrastructure from Bangkok.",
  email: "fronk.kunanon@gmail.com",
  tagline: "Building fintech and digital workspaces from Bangkok.",
} as const;

export type NavChild = { label: string; href: string };

export type NavItem =
  | { type: "link"; label: string; href: string }
  | {
      type: "menu";
      label: string;
      /** Optional parent href (e.g. section deep-link). */
      href?: string;
      children: readonly NavChild[];
    };

/** Human library pages (creed-style secondary IA) — home footer + Library nav menu */
export const footerLibrary = [
  { label: "Learn", href: "/learn" },
  { label: "Examples", href: "/examples" },
  { label: "Stack", href: "/stack" },
  { label: "Proof", href: "/proof" },
  { label: "Build", href: "/build" },
] as const;

/** Primary chrome items (creed-style pill). Flat links + Library menu + Contact CTA. */
export const primaryNav: readonly NavItem[] = [
  { type: "link", label: "About", href: "/about" },
  { type: "link", label: "Ventures", href: "/#ventures" },
  {
    type: "menu",
    label: "Library",
    children: footerLibrary.map((item) => ({
      label: item.label,
      href: item.href,
    })),
  },
  { type: "link", label: "Blog", href: "/blog" },
  { type: "link", label: "Press", href: "/press" },
];

export const navCta = { label: "Contact", href: "/contact" } as const;

/**
 * Flat nav for scroll-spy / active helpers (includes wordmark + CTA + menu parents).
 * @deprecated Prefer `primaryNav` + `navCta` for chrome; kept for spy helpers.
 */
export const nav = [
  { label: "KunanonJ", href: "/" },
  { label: "About", href: "/about" },
  { label: "Ventures", href: "/#ventures" },
  { label: "Blog", href: "/blog" },
  { label: "Press", href: "/press" },
  { label: "Contact", href: "/contact" },
] as const;

/** Operator keyword tips (hpbrn-style) for home about / about page. */
export const aboutKeywords = [
  { text: "Bangkok", tip: "Base of operations — Thailand first, SEA next" },
  { text: "GoGoCash", tip: "Shopping-to-earn cashback · 1,000+ users" },
  { text: "Manut", tip: "ERP/CRM + Intelligence AI for automotive SMEs" },
  { text: "ERP/CRM", tip: "Internal systems before agent theater" },
] as const;

export const hero = {
  wordmark: site.wordmark,
  description:
    "Founder of GoGoCash and Manut — cashback for shoppers, an ERP/CRM workspace with Intelligence AI for SME in Automotive Industry.",
  ctaLabel: "See ventures",
  ctaHref: "#ventures",
  contextLabel: site.contextLabel,
} as const;

export const about = {
  label: "About",
  segments: [
    { text: "I am Kunanon Jarat,", className: "font-normal" },
    { text: "a Bangkok founder.", className: "italic font-serif" },
    {
      text: "I build GoGoCash, Manut, and Airplusauto from Bangkok.",
      className: "font-normal",
    },
  ],
  body: "Founder of GoGoCash and Manut — cashback for shoppers, and an ERP/CRM workspace with Intelligence AI for SMEs in the automotive industry. Based in Bangkok.",
  portraitSrc: "/profile.jpg",
  portraitAlt: "Kunanon Jarat — headshot",
  ctaLabel: "More About Me",
  ctaHref: "/about",
} as const;

export const ventures = {
  eyebrow: "Ventures",
  line1: "3 ventures. Built from Bangkok.",
  line2: "Fintech, AI workspaces, and more.",
  videoTitle: "Building from Thailand, Sleep in Bangkok",
  cards: [
    {
      type: "video" as const,
      title: "Building from Thailand, Sleep in Bangkok",
    },
    {
      type: "info" as const,
      number: "01",
      title: "GoGoCash",
      icon: "/brand/gogocash.svg",
      items: [
        "1,000+ users",
        "220+ merchants",
        "Up to 30% cashback",
        "Shopping-to-earn platform",
      ],
      href: "/ventures/gogocash",
    },
    {
      type: "info" as const,
      number: "02",
      title: "Manut",
      icon: "/brand/manut.png",
      items: [
        "ERP/CRM for automotive SMEs",
        "Intelligence AI workspace",
        "Ops in one place",
      ],
      href: "/ventures/manut",
    },
    {
      type: "info" as const,
      number: "03",
      title: "Airplusauto",
      icon: "/brand/airplusauto.png",
      items: ["Venture in flight", "Shipping from Bangkok", "More soon"],
      href: "https://airplusauto.com",
    },
  ],
} as const;

export const socials = [
  { label: "X", href: "https://x.com/fkj98" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/kunanonj" },
  { label: "GitHub", href: "https://github.com/KunanonJ" },
] as const;

/** Machine-readable / agent surfaces linked from the home footer */
export const footerResources = [
  { label: "Agents", href: "/agents.md" },
  { label: "sitemap.md", href: "/sitemap.md" },
  { label: "llms.txt", href: "/llms.txt" },
  { label: "skills.md", href: "/skills.md" },
  { label: "rss.xml", href: "/rss.xml" },
] as const;

export const contact = {
  label: "Contact",
  email: site.email,
  tagline: site.tagline,
  ctaLabel: "Contact Me",
  ctaHref: "/contact",
} as const;
