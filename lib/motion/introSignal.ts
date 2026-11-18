import { INTRO_SESSION_KEY } from "@/lib/content/introGreetings";

/*
 * The greeting intro hands over to the redesigned hero (profile redesign,
 * design spec 5.6). On a first visit an inline script marks
 * `<html data-intro="pending">` before the hero paints, so the hero shows
 * still under the intro instead of playing its entrance there. A visit made
 * in the app runs no inline script, so IntroLoader marks it pending itself,
 * before its first paint. IntroLoader marks it "done" when its exit starts
 * (skip included), and the entrance plays under the fading overlay. Later
 * visits never mark it pending.
 */

const ATTRIBUTE = "data-intro";

/**
 * Runs before the hero paints. It asks what IntroLoader asks before it plays
 * (seen this session? reduced motion?), so the two always agree; blocked
 * storage counts as unseen in both.
 */
export const INTRO_PENDING_SCRIPT = `(function(){var seen;try{seen=sessionStorage.getItem(${JSON.stringify(INTRO_SESSION_KEY)})}catch(e){}try{if(seen!=="1"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute(${JSON.stringify(ATTRIBUTE)},"pending")}}catch(e){}})()`;

/**
 * The intro is about to cover the page: IntroLoader's mark for a visit made
 * in the app, where the inline script never runs.
 */
export function markIntroPending(): void {
  document.documentElement.setAttribute(ATTRIBUTE, "pending");
}

/** The intro has ended, or is ending: the hero may move now. */
export function markIntroDone(): void {
  document.documentElement.setAttribute(ATTRIBUTE, "done");
}

/** True while a first-visit intro still covers the page. */
export function introPending(): boolean {
  return document.documentElement.getAttribute(ATTRIBUTE) === "pending";
}

/** Calls back whenever the intro's mark on <html> changes. */
export function subscribeIntro(onChange: () => void): () => void {
  if (typeof MutationObserver === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [ATTRIBUTE],
  });
  return () => observer.disconnect();
}
