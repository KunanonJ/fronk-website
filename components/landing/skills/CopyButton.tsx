"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type CopyButtonProps = {
  /** Text to copy. */
  text?: string;
  /** Or copy the text content of this element (keeps big text out of props). */
  sourceId?: string;
  /** Visible label, e.g. "Copy". */
  label?: string;
  /** Unambiguous accessible name, e.g. "Copy npx install command for verify-loop". */
  accessibleLabel: string;
  /** What the live region says after a copy, e.g. "Copied verify-loop install command". */
  announcement?: string;
  className?: string;
};

type Status = "idle" | "copied" | "error";

const RESET_MS = 2000;

async function writeClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy path (permissions, older browsers).
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/**
 * Copy-to-clipboard button. The visible label flips to "Copied" (or
 * "Failed", with the Ember failure square) in a slot sized for every word,
 * so the button never changes width, and a polite live region announces the
 * result for screen readers. A native button, so Enter and Space work.
 */
export default function CopyButton({
  text,
  sourceId,
  label = "Copy",
  accessibleLabel,
  announcement = "Copied",
  className,
}: CopyButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const value =
      text ??
      (sourceId ? (document.getElementById(sourceId)?.textContent ?? "") : "");
    const ok = value !== "" && (await writeClipboard(value));
    setStatus(ok ? "copied" : "error");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), RESET_MS);
  };

  const words: Record<Status, string> = {
    idle: label,
    copied: "Copied",
    error: "Failed",
  };

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={accessibleLabel}
        data-status={status}
        className={cn(
          "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-3 text-sm text-ink transition-colors duration-150 ease-smooth hover:border-ink/40 hover:bg-surface-tint",
          className,
        )}
      >
        {status === "copied" ? (
          <Check className="h-3.5 w-3.5 shrink-0 text-success-text" aria-hidden />
        ) : status === "error" ? (
          // Ember marks a failure, always next to the word "Failed".
          <span aria-hidden className="mx-[3px] size-2 shrink-0 bg-ember" />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
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
