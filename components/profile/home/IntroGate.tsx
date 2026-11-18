import { useSyncExternalStore } from "react";
import {
  INTRO_PENDING_SCRIPT,
  introPending,
  subscribeIntro,
} from "@/lib/motion/introSignal";

/*
 * The hero's side of the intro hand-over (design spec 5.6). The script goes
 * first in the hero's server HTML, so it runs before any of the hero paints;
 * it removes itself once it has run, and the client renders nothing in its
 * place, so hydration finds what it expects. Scripts that render on the
 * client never run, so a client-side visit plays the entrance at once.
 */
export function IntroPendingScript() {
  if (typeof window !== "undefined") return null;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `${INTRO_PENDING_SCRIPT};document.currentScript&&document.currentScript.remove()`,
      }}
    />
  );
}

/**
 * False on the server and while a first-visit intro covers the page; true
 * once the hero can be seen, which is when its timed motion may start.
 */
export function useIntroDone(): boolean {
  return useSyncExternalStore(
    subscribeIntro,
    () => !introPending(),
    () => false,
  );
}
