"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

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
 * Copy-to-clipboard button. The visible label flips to "Copied" in a slot
 * sized for both words (no layout shift) and a polite live region announces
 * the result for screen readers. A native button, so Enter and Space work.
 */
export default function CopyButton({
  text,
  sourceId,
  label = "Copy",
  accessibleLabel,
  announcement = "Copied",
  className = "",
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
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

  const copied = status === "copied";

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={accessibleLabel}
        className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-primary/20 px-3 text-sm text-primary/85 transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-landing ${className}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
        )}
        {/* Both words share one grid cell, so the button keeps its width. */}
        <span className="grid" aria-hidden>
          <span
            className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}
          >
            {label}
          </span>
          <span
            className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}
          >
            Copied
          </span>
        </span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? announcement : status === "error" ? "Copy failed" : ""}
      </span>
    </>
  );
}
