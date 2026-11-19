import { HOME_CARD } from "@/lib/og/profileCards";
import { renderProfileCard } from "@/lib/og/render";

/** The site-wide share card: the Home hero beside the portrait. */
export default function OpenGraphImage() {
  return renderProfileCard(HOME_CARD);
}
