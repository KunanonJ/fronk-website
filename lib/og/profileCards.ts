import { aboutPage } from "@/lib/content/aboutPage";
import { AVAILABILITY } from "@/lib/content/availability";
import { PERSON_NAME } from "@/lib/content/identity";
import { hero } from "@/lib/content/landing";
import type { ProfileCardProps } from "@/lib/og/profileCard";

/*
 * What the Home and About share cards say: each page's hero, word for word,
 * from the content modules. Server-only (the share image routes and tests),
 * so the content and the portrait stay out of the pages' bundles.
 */

/** The site-wide card (/opengraph-image), which Home and most pages share. */
export const HOME_CARD: ProfileCardProps = {
  pill: AVAILABILITY.pill.label,
  lines: [[`${hero.greeting} ${hero.name}`], ...hero.headline.map((l) => [l])],
  accent: hero.headlineAccent,
  lead: hero.homeLead,
};

const about = aboutPage.hero.headline;

/** /about/opengraph-image: the About hero, muted words included. */
export const ABOUT_CARD: ProfileCardProps = {
  pill: AVAILABILITY.pill.label,
  lines: [
    [{ muted: about.muted }, about.name],
    [about.focus, { muted: about.joiner }],
  ],
  accent: about.accent,
  lead: aboutPage.hero.role,
};

/** The card's alt text: the portrait and the headline it sits beside. */
export function profileCardAlt({ lines, accent }: ProfileCardProps): string {
  const headline = [
    ...lines.map((line) =>
      line
        .map((part) => (typeof part === "string" ? part : part.muted))
        .join(" "),
    ),
    accent,
  ].join(" ");
  return `${PERSON_NAME}’s portrait beside “${headline}”`;
}
