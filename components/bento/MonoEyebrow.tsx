import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Hero eyebrow in Geist Mono (bento canvas Press, 404 and Topic): a 12 px
 * uppercase ink-2 pill with the 6 px accent square. `EyebrowChip` is the
 * 13 px sans variant.
 */
export function MonoEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "m-0 inline-flex items-center gap-2 self-start rounded-full border border-hairline-strong bg-surface px-3 py-[7px] font-mono text-xs leading-none tracking-[0.06em] text-ink-2 uppercase",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
      {children}
    </p>
  );
}
