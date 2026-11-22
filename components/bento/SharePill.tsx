import { useChrome } from "@/components/bento/ChromeContext";
import { ShareIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import { cn } from "@/lib/utils/cn";

/*
 * Each size's padding and phone width: the icon leads the label, so the
 * padding is even on both sides (a hero pill's is 22 then 16 px, for an
 * arrow after its label).
 */
const SIZES = {
  hero: "px-[22px] max-sm:w-11",
  lg: "px-6 max-sm:w-13",
} as const;

/**
 * Hero "Share" pill. It opens the header's share panel, so the two share one
 * state and one aria-expanded value. `labelLang` marks the label's language
 * on a page in another one (the Thai topic hubs keep "Share" in English).
 *
 * A ghost pill of its row's size (UX hunt 22-11-26): 44 px with 16 px text,
 * as the hero pills beside it (`hero`, the default), or 52 px beside the
 * case pages' link out (`lg`). It was a 56 px pill of 17 px semibold text,
 * taller and bolder than the call to action next to it.
 *
 * Below 640 px it is a round icon of that height, so it can sit beside the
 * hero's other buttons instead of wrapping alone onto a row of its own (the
 * owner's choice, 12-11-26). The label stays in the button for screen
 * readers.
 */
export default function SharePill({
  label = "Share",
  labelLang,
  size = "hero",
}: {
  label?: string;
  labelLang?: string;
  size?: keyof typeof SIZES;
}) {
  const { panel, toggle } = useChrome();
  return (
    <button
      type="button"
      aria-controls={panel === "share" ? "share-panel" : undefined}
      aria-expanded={panel === "share"}
      data-panel-trigger
      onClick={(event) => toggle("share", event.currentTarget)}
      className={cn(
        pillClass({ variant: "ghost", size }),
        SIZES[size],
        "max-sm:px-0",
      )}
    >
      <ShareIcon />
      <span lang={labelLang} className="max-sm:sr-only">
        {label}
      </span>
    </button>
  );
}
