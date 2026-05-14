export const siteConfig = {
  name: "Fronk Kunanon Jarat",
  shortName: "Fronk",
  tagline: "Building fintech for Southeast Asia.",
  description:
    "Personal site of Kunanon Jarat (Fronk) — founder of GoGoCash, building fintech and adjacent infrastructure from Bangkok.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fronk.example.com",
  // OG image is generated dynamically by app/opengraph-image.tsx — no static
  // asset needed.
  email: "fronk.kunanon@gmail.com",
  socials: {
    x: "https://x.com/fkj98",
    linkedin: "https://www.linkedin.com/in/kunanonj",
    github: "https://github.com/KunanonJ",
    telegram: "https://t.me/fkj98",
    farcaster: "https://farcaster.xyz/fronk98",
    website: "https://gogocash.co",
  },
  discordHandle: "fronk98",
} as const;

export type SiteConfig = typeof siteConfig;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/ventures", label: "Ventures" },
  { href: "/writing", label: "Writing" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
] as const;
