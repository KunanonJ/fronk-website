import { PAGE_META } from "@/lib/content/pageMeta";
/** Coverage types, in filter order (bento canvas Press, design spec 4.19). */
export const PRESS_TYPES = ["Feature", "Product", "Profile"] as const;
export type PressType = (typeof PRESS_TYPES)[number];

export type PressItem = {
  id: string;
  title: string;
  description: string;
  /** ISO date `YYYY-MM-DD` — rendered as `DD/MM/YYYY`. */
  date: string;
  href: string;
  bannerSrc: string;
  bannerAlt: string;
  /** The coverage type: the card's kicker and the page's filter. */
  source: PressType;
};

export const pressPage = {
  eyebrow: "Press",
  title: "Press",
  description: PAGE_META.press.description,
  /** The description's two sentences as the canvas hero draws them. */
  headline: {
    muted: "Selected",
    middle: "coverage",
    joiner: "and",
    accent: "mentions.",
  },
  lead: "Click through to read the full piece.",
} as const;

/** Static press stock — replace / extend as coverage lands. */
export const pressItems: readonly PressItem[] = [
  {
    id: "asia-21-2026",
    title: "Building fintech from Bangkok — founder notes",
    description:
      "A short look at shipping cashback and AI workspaces for Southeast Asia from Bangkok.",
    date: "2026-07-09",
    href: "https://gogocash.co",
    bannerSrc: "/banners/city-skyline.webp",
    bannerAlt: "City skyline at dusk",
    source: "Feature",
  },
  {
    id: "gogocash-cashback",
    title: "GoGoCash brings shopping-to-earn cashback to more merchants",
    description:
      "How a Bangkok-built cashback layer helps shoppers earn back across everyday brands.",
    date: "2026-05-18",
    href: "https://gogocash.co",
    bannerSrc: "/banners/retail-shopping.webp",
    bannerAlt: "Shopping and payments",
    source: "Product",
  },
  {
    id: "manut-workspace",
    title: "Manut: an Intelligence AI workspace for automotive SMEs",
    description:
      "ERP/CRM and AI in one place — built for operators who need focus, not another tab.",
    date: "2026-03-02",
    href: "https://manut.xyz",
    bannerSrc: "/banners/digital-interface.webp",
    bannerAlt: "Digital workspace interface",
    source: "Product",
  },
  {
    id: "bangkok-builders",
    title: "Bangkok founders shipping fintech and AI infrastructure",
    description:
      "Notes on building in public from Thailand’s startup scene — ventures, pace, and craft.",
    date: "2025-11-20",
    href: "https://kunanonj.com",
    bannerSrc: "/banners/bangkok-night.webp",
    bannerAlt: "Bangkok street at night",
    source: "Profile",
  },
] as const;

/** Format ISO `YYYY-MM-DD` as `DD/MM/YYYY`. */
export function formatPressDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) return isoDate;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}
