import { useSyncExternalStore } from "react";
import { ScriptOnce } from "@tanstack/react-router";
import {
  INTRO_PENDING_SCRIPT,
  introPending,
  subscribeIntro,
} from "@/lib/motion/introSignal";

/*
 * The hero's side of the intro hand-over (design spec 5.6). The script goes
 * first in the hero's server HTML, so it runs before any of the hero paints.
 * TanStack's ScriptOnce writes it on the server only, with the router's CSP
 * nonce when one is set (`ssr.nonce`), and appends
 * `;document.currentScript.remove()`, so hydration finds nothing in its
 * place. Scripts that render on the client never run; IntroLoader marks a
 * visit made in the app itself (lib/motion/introSignal.ts). The script's
 * sha256 is pinned in Hero.ssr.test.ts for Phase 8's Content Security Policy.
 */
export function IntroPendingScript() {
  return <ScriptOnce>{INTRO_PENDING_SCRIPT}</ScriptOnce>;
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
