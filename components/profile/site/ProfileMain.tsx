import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * The <main> of a page in the profile redesign (Phase 6 cutover): the skip
 * link's target, under the fixed bar (`.pf-main` pads it by the bar's height;
 * a hero or a case page that sits under the bar takes that padding back).
 * The pages Phase 7 restyles keep the old `PageMain`.
 */
export function ProfileMain({
  className,
  children,
  ...rest
}: ComponentPropsWithoutRef<"main">) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={cn("pf-main outline-none", className)}
      {...rest}
    >
      {children}
    </main>
  );
}
