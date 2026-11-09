import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/bento/icons";
import { cn } from "@/lib/utils/cn";
import { writeClipboard } from "@/lib/utils/clipboard";

/** Canvas sizes: command rows, the agent prompt, and the skill wells. */
const SIZE = {
  row: { className: "min-w-[104px] px-3.5 text-sm", icon: 16 },
  prompt: { className: "min-w-[136px] px-4 text-sm", icon: 16 },
  card: { className: "min-w-[112px] px-[11px] text-meta", icon: 14 },
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
 * Copy-to-clipboard pill (bento canvas, design spec 3.7). The icon turns into
 * the accent check and the label into "Copied" (or "Failed", with the Ember
 * failure square) for two seconds, in a slot sized for every word, so the
 * button never changes width. A polite live region announces the result.
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
  const { className: sizeClass, icon } = SIZE[size];

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={accessibleLabel}
        data-status={status}
        className={cn(
          "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-hairline-strong bg-surface font-medium text-ink",
          sizeClass,
          className,
        )}
      >
        {status === "copied" ? (
          <CheckIcon size={icon} className="shrink-0 text-mark" />
        ) : status === "error" ? (
          // Ember marks a failure, always next to the word "Failed".
          <span aria-hidden className="mx-[3px] size-2 shrink-0 bg-ember" />
        ) : (
          <CopyIcon size={icon} className="shrink-0" />
        )}
        {/* Every word shares one grid cell, so the button keeps its width. */}
        <span className="grid" aria-hidden>
          {(Object.keys(words) as Status[]).map((key) => (
            <span
              key={key}
              className={cn(
                "col-start-1 row-start-1",
                key !== status && "invisible",
              )}
            >
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
