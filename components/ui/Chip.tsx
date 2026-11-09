import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ChipTone = "neutral" | "signal";
export type ChipState = "live" | "failed";

const TONES: Record<ChipTone, string> = {
  neutral: "border-hairline-strong bg-surface text-ink-2",
  signal: "border-transparent bg-surface-tint text-link",
};

const STATE_LABEL: Record<ChipState, string> = {
  live: "Live",
  failed: "Failed",
};

/**
 * Small mono chip (visual-redesign Phase 0). `state` adds an 8 px Ember square
 * with a visible word: Ember never appears without text, and the square sits
 * on the chip's own Paper fill (neutral tone) so it keeps 3:1.
 */
export function Chip({
  tone = "neutral",
  state,
  className,
  children,
}: {
  tone?: ChipTone;
  state?: ChipState;
  className?: string;
  children: ReactNode;
}) {
  const effectiveTone = state ? "neutral" : tone;
  return (
    <span
      data-state={state}
      className={cn(
        "inline-flex min-h-6 items-center gap-1.5 rounded-chip border px-2.5 py-0.5 font-mono text-label uppercase",
        TONES[effectiveTone],
        className,
      )}
    >
      {state ? (
        <>
          <span aria-hidden className="size-2 shrink-0 bg-ember" />
          <span className="text-ink">{STATE_LABEL[state]}</span>
          <span aria-hidden className="text-ink-2">
            ·
          </span>
        </>
      ) : null}
      {children}
    </span>
  );
}
