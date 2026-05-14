export const siteConfig = {
  name: "Fronk Kunanon Jarat",
  shortName: "Fronk",
  tagline: "Founder building from zero.",
  description:
    "Personal site of Fronk Kunanon Jarat — founder, builder, and writer. Notes on ventures, technology, and the work of starting things.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fronk.example.com",
  ogImage: "/og-default.png",
  email: "fronk.kunanon@gmail.com",
  socials: {
    x: "https://x.com/REPLACE",
    linkedin: "https://www.linkedin.com/in/REPLACE",
    github: "https://github.com/REPLACE",
  },
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
