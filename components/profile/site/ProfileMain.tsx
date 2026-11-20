import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The <main> of a page in the profile redesign (Phase 6 cutover): the skip
 * link's target, under the fixed bar (`.pf-main` pads it by the bar's height;
 * a hero or a case page that sits under the bar takes that padding back).
 * With `reading` (the long reads: the case studies, the topic hubs, /about),
 * a 2 px line at the top of the screen fills as the main content is read
 * (`.pf-reading`, shell.css: CSS only, a view timeline on this element).
 */
export function ProfileMain({
  reading = false,
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"main"> & { reading?: boolean }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn(
        "pf-main outline-none",
        reading && "pf-main--reading",
        className,
      )}
      {...rest}
    >
      {reading ? <div className="pf-reading" aria-hidden="true" /> : null}
      {children}
    </main>
  );
}
