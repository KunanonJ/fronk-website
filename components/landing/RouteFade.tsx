import { useLayoutEffect, useRef } from "react";
import { usePathname } from "@/lib/router/navigation";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/** Fade-in length for the incoming page. */
export const ROUTE_FADE_MS = 250;

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

function isStudio(pathname: string): boolean {
  return pathname === "/studio" || pathname.startsWith("/studio/");
}

/**
 * Whether a client navigation from `from` to `to` should fade the new page.
 * No fade on first paint, on same-path updates (query or hash only), or into
 * or out of Sanity Studio.
 */
export function shouldFadeRoute(from: string | null, to: string): boolean {
  if (from === null || from === to) return false;
  return !isStudio(from) && !isStudio(to);
}

/**
 * Fades the incoming page's `<main id="main">` in over ROUTE_FADE_MS after a
 * client navigation. It animates opacity only (no transform, so fixed-position
 * children keep working), never covers the page with an overlay, and leaves
 * the nav and footer alone. Skipped under reduced motion.
 *
 * Runs in a layout effect so the new page never paints at full opacity first.
 * React `<ViewTransition>` was considered (stable in React 19.3 + Next 16.4)
 * but snapshots the whole viewport, freezing the custom cursor and nav for the
 * duration; this is lighter and works in every browser.
 */
export default function RouteFade() {
  const pathname = usePathname() ?? "/";
  const prevRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const from = prevRef.current;
    prevRef.current = pathname;
    if (!shouldFadeRoute(from, pathname) || prefersReducedMotion()) return;

    const main = document.getElementById("main");
    if (!main || typeof main.animate !== "function") return;

    const animation = main.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: ROUTE_FADE_MS,
      easing: EASE_OUT,
    });
    return () => animation.cancel();
  }, [pathname]);

  return null;
}
