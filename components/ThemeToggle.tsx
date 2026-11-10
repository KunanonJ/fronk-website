import { useSyncExternalStore, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { ICON_BUTTON } from "@/components/bento/classes";
import { MoonIcon, SunIcon } from "@/components/bento/icons";
import { track } from "@/lib/analytics/track";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import { cn } from "@/lib/utils/cn";

type Theme = "light" | "dark";

const noop = () => () => {};

/** False on the server and during hydration, true once the client renders. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** View-transition types (Chrome 125+, Safari 18.2+); older engines get the class only. */
function supportsTransitionTypes(): boolean {
  return (
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("selector(:active-view-transition-type(a))")
  );
}

/**
 * Day/night switch (bento redesign, phase 7a; design spec 2.3 and 3.3). With
 * View Transitions and motion allowed, the new theme is revealed in a circle
 * that grows from the click point (from the button's centre on keyboard
 * activation). The transition carries the type "theme" (and html.kj-vt), so
 * the router's page transitions never play the reveal. Reduced motion, or no
 * View Transitions, switches at once.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  // Before hydration, assume the default (light) so the label matches SSR.
  const isDark = hydrated && resolvedTheme === "dark";
  const label = isDark ? "Switch to day mode" : "Switch to night mode";

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const next: Theme = root.classList.contains("dark") ? "light" : "dark";
    track("theme_change", { theme: next });

    if (
      typeof document.startViewTransition !== "function" ||
      prefersReducedMotion()
    ) {
      setTheme(next);
      return;
    }

    // Apply the class directly, then commit next-themes synchronously, so the
    // "new" snapshot is guaranteed to show the new theme.
    const update = () => {
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      flushSync(() => setTheme(next));
    };
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    root.style.setProperty("--vtx", `${Math.round(x)}px`);
    root.style.setProperty("--vty", `${Math.round(y)}px`);
    root.classList.add("kj-vt");
    const transition = supportsTransitionTypes()
      ? document.startViewTransition({ update, types: ["theme"] })
      : document.startViewTransition(update);
    const done = () => root.classList.remove("kj-vt");
    transition.finished.then(done, done);
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(ICON_BUTTON, className)}
    >
      {/* CSS picks the icon from html.dark, so it is right before hydration. */}
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </button>
  );
}
