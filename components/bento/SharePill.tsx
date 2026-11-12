import { useChrome } from "@/components/bento/ChromeContext";
import { ShareIcon } from "@/components/bento/icons";

/**
 * Hero "Share" pill (bento canvas, design spec 3.4). It opens the header's
 * share panel, so the two share one state and one aria-expanded value.
 * `labelLang` marks the label's language on a page in another one (the Thai
 * topic hubs keep "Share" in English).
 *
 * Below 640 px it is a 56 px round icon, so it can sit beside the hero's
 * other buttons instead of wrapping alone onto a row of its own (the owner's
 * choice, 12-11-26). The label stays in the button for screen readers.
 */
export default function SharePill({
  label = "Share",
  labelLang,
}: {
  label?: string;
  labelLang?: string;
}) {
  const { panel, toggle } = useChrome();
  return (
    <button
      type="button"
      aria-controls={panel === "share" ? "share-panel" : undefined}
      aria-expanded={panel === "share"}
      data-panel-trigger
      onClick={(event) => toggle("share", event.currentTarget)}
      className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-[30px] text-[17px] font-semibold text-ink max-sm:w-14 max-sm:px-0"
    >
      <ShareIcon />
      <span lang={labelLang} className="max-sm:sr-only">
        {label}
      </span>
    </button>
  );
}
