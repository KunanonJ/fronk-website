import { ABOUT_CARD } from "@/lib/og/profileCards";
import { renderProfileCard } from "@/lib/og/render";

/** The /about share card: the About hero beside the portrait. */
export default async function AboutOgImage() {
  return renderProfileCard(ABOUT_CARD);
}
