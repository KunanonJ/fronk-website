export const site = {
  wordmark: "KunanonJ",
  contextLabel: "Bangkok 🇹🇭 · Founder",
  title: "Fronk Kunanon Jarat — Building fintech and AI from Bangkok.",
  description:
    "Personal site of Kunanon Jarat (Fronk) — founder of GoGoCash, building fintech and adjacent infrastructure from Bangkok.",
  email: "fronk.kunanon@gmail.com",
  tagline: "Building fintech and digital workspaces from Bangkok.",
} as const;

export const nav = [
  { label: "About", href: "#about" },
  { label: "Ventures", href: "#ventures" },
  { label: "Contact", href: "#contact" },
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
  ctaHref: "/showcase",
} as const;

export const ventures = {
  eyebrow: "Ventures",
  line1: "Three ventures. Built from Bangkok.",
  line2: "Fintech, AI workspaces, and more.",
  videoTitle: "Building from Bangkok.",
  cards: [
    {
      type: "video" as const,
      title: "Building from Bangkok.",
    },
    {
      type: "info" as const,
      number: "01",
      title: "GoGoCash",
      icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
      items: [
        "1,000+ users",
        "220+ merchants",
        "Up to 30% cashback",
        "Shopping-to-earn platform",
      ],
      href: "https://gogocash.co",
    },
    {
      type: "info" as const,
      number: "02",
      title: "Manut",
      icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
      items: [
        "ERP/CRM for automotive SMEs",
        "Intelligence AI workspace",
        "Ops in one place",
      ],
      href: "https://manut.xyz",
    },
    {
      type: "info" as const,
      number: "03",
      title: "Airplusauto",
      icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
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

export const contact = {
  label: "Contact",
  email: site.email,
  tagline: site.tagline,
} as const;
