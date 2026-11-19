import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import { cn } from "@/lib/utils/cn";
import { writeClipboard } from "@/lib/utils/clipboard";

/** Ghost pills: 44 px for command rows and the agent prompt, 36 px in a skill tile. */
const SIZE = {
  row: { size: "md", icon: 16 },
  prompt: { size: "md", icon: 16 },
  card: { size: "sm", icon: 14 },
} as const;

type CopyButtonProps = {
  /** Text to copy. */
  text: string;
  /** Visible label, e.g. "Copy". */
  label?: string;
  /** Unambiguous accessible name, e.g. "Copy install command for verify-loop". */
  accessibleLabel: string;
  /** What the live region says after a copy, e.g. "Copied verify-loop install command". */
  announcement?: string;
  size?: keyof typeof SIZE;
  className?: string;
};

type Status = "idle" | "copied" | "error";

const RESET_MS = 2000;

/**
 * Copy-to-clipboard pill (profile redesign Phase 7c; design spec 6.1, the
 * ghost pill). The icon turns into the accent check and the label into
 * "Copied" (or "Failed", with the coral failure square) for two seconds, in
 * a cell sized for every word, so the pill never changes width. A polite
 * live region announces the result.
 */
export default function CopyButton({
  text,
  label = "Copy",
  accessibleLabel,
  announcement = "Copied",
  size = "row",
  className,
}: CopyButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = text !== "" && (await writeClipboard(text));
    setStatus(ok ? "copied" : "error");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), RESET_MS);
  };

  const words: Record<Status, string> = {
    idle: label,
    copied: "Copied",
    error: "Failed",
  };
  const { size: pill, icon } = SIZE[size];

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={accessibleLabel}
        data-status={status}
        className={cn(
          pillClass({ variant: "ghost", size: pill }),
          "pf-cat-copy",
          className,
        )}
      >
        <span className="ds-pill__icon" aria-hidden="true">
          {status === "copied" ? (
            <CheckIcon size={icon} className="pf-cat-copy__done" />
          ) : status === "error" ? (
            // Coral marks a failure, always next to the word "Failed".
            <span className="pf-cat-copy__failed" />
          ) : (
            <CopyIcon size={icon} />
          )}
        </span>
        {/* Every word shares one grid cell, so the pill keeps its width. */}
        <span className="pf-cat-copy__words" aria-hidden>
          {(Object.keys(words) as Status[]).map((key) => (
            <span key={key} data-off={key !== status ? "" : undefined}>
              {words[key]}
            </span>
          ))}
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? announcement
          : status === "error"
            ? "Copy failed"
            : ""}
      </span>
    </>
  );
}
