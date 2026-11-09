import { useChrome } from "@/components/bento/ChromeContext";
import { ShareIcon } from "@/components/bento/icons";

/**
 * Hero "Share" pill (bento canvas, design spec 3.4). It opens the header's
 * share panel, so the two share one state and one aria-expanded value.
 */
export default function SharePill({ label = "Share" }: { label?: string }) {
  const { panel, toggle } = useChrome();
  return (
    <button
      type="button"
      aria-controls="share-panel"
      aria-expanded={panel === "share"}
      onClick={(event) => toggle("share", event.currentTarget)}
      className="inline-flex h-14 items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-[30px] text-[17px] font-semibold text-ink"
    >
      <ShareIcon />
      <span>{label}</span>
    </button>
  );
}
