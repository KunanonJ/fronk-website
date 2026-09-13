import { resolvePublicSiteUrl } from "@/lib/seo/siteUrl";

export const siteConfig = {
  name: "Fronk Kunanon Jarat",
  shortName: "KunanonJ",
  tagline: "Building fintech and AI from Bangkok.",
  description:
    "Personal site of Kunanon Jarat (Fronk) — founder of GoGoCash, building fintech and adjacent infrastructure from Bangkok.",
  /** Fail-closed via resolvePublicSiteUrl — never emit fronk.example.com in production. */
  url: resolvePublicSiteUrl(),
  // OG image is generated dynamically by app/opengraph-image.tsx — no static
  // asset needed.
  email: "fronk.kunanon@gmail.com",
  socials: {
    x: "https://x.com/fkj98",
    linkedin: "https://www.linkedin.com/in/kunanonj",
    github: "https://github.com/KunanonJ",
    telegram: "https://t.me/fkj98",
    farcaster: "https://farcaster.xyz/fronk98",
    /** Product URL — not a Person sameAs profile. */
    website: "https://gogocash.co",
  },
  discordHandle: "fronk98",
} as const;

export type SiteConfig = typeof siteConfig;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/now", label: "Now" },
  { href: "/#ventures", label: "Ventures" },
  { href: "/blog", label: "Blog" },
  // /resume is intentionally hidden from primary nav for now. The route
  // still works at /resume and the PDF at /resume.pdf for direct sharing.
  { href: "/contact", label: "Contact" },
] as const;
