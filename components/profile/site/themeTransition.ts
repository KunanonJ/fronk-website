import { flushSync } from "react-dom";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * The theme switch of the profile chrome (design spec 7.5). With motion
 * allowed and View Transitions available, the new theme fades in over a frozen
 * image of the old one (the `theme` type, styled in profile/shell.css). Else
 * the theme changes at once, and CSS transitions stay off for two frames so
 * colours do not drift in. The live site keeps its own circular reveal until
 * the Phase 6 cutover; this switch never starts that one.
 */

type ThemeName = "light" | "dark";

/** View-transition types (Chrome 125+, Safari 18.2+); older engines get the class only. */
function supportsTransitionTypes(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("selector(:active-view-transition-type(a))")
  );
}

/** Stops CSS transitions for two frames, so the new colours land at once. */
function suppressTransitions(root: HTMLElement) {
  root.classList.add("theme-switching");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove("theme-switching"));
  });
}

export function switchTheme(
  next: ThemeName,
  setTheme: (theme: ThemeName) => void,
): void {
  const root = document.documentElement;
  if (
    typeof document.startViewTransition !== "function" ||
    prefersReducedMotion()
  ) {
    suppressTransitions(root);
    setTheme(next);
    return;
  }

  // Apply the class first and commit next-themes synchronously, so the "new"
  // snapshot already shows the new theme.
  const update = () => {
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    flushSync(() => setTheme(next));
  };
  // `kj-vt` carries the fade in engines without view-transition types; the
  // theme-switching class is the same two-frame guard as above.
  root.classList.add("kj-vt", "theme-switching");
  const transition = supportsTransitionTypes()
    ? document.startViewTransition({ update, types: ["theme"] })
    : document.startViewTransition(update);
  const done = () => root.classList.remove("kj-vt", "theme-switching");
  transition.finished.then(done, done);
}
