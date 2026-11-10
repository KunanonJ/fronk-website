import { PERSON_NAME } from "@/lib/content/identity";
import { renderOgCard } from "@/lib/og/render";

/** The /about share card: who he is, in the identity's own words. */
export default async function AboutOgImage() {
  return renderOgCard({
    eyebrow: "About",
    title: PERSON_NAME,
    subtitle:
      "AI Engineering Lead and solopreneur in Bangkok. Founder of GoGoCash, builder of Manut AI.",
  });
}
