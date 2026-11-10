import { useChrome } from "@/components/bento/ChromeContext";
import { ShareIcon } from "@/components/bento/icons";

/**
 * Hero "Share" pill (bento canvas, design spec 3.4). It opens the header's
 * share panel, so the two share one state and one aria-expanded value.
 * `labelLang` marks the label's language on a page in another one (the Thai
 * topic hubs keep "Share" in English).
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
      className="inline-flex h-14 items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-[30px] text-[17px] font-semibold text-ink"
    >
      <ShareIcon />
      <span lang={labelLang}>{label}</span>
    </button>
  );
}
