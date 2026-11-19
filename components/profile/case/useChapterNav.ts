import { useCallback, useMemo, useState, type MouseEvent } from "react";
import { useScrollspy } from "@/components/profile/site/scrollspy";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * The case page's contents (profile redesign Phase 5, design spec 9.6): which
 * chapter is in view, and how a contents link moves to one. The scrollspy is
 * the chrome's (Phase 1): the band from 20 % to 40 % of the screen, the
 * topmost chapter in it wins. Between chapters the last one stays current.
 */

/** True for a click the browser should keep: a new tab or window. */
function modified(event: MouseEvent): boolean {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

/**
 * Moves to chapter `id` without the browser's own jump: the chapter lands
 * 112 px below the top (scroll-padding plus its scroll margin, shell.css),
 * smoothly unless motion is reduced; the address takes its hash without a new
 * history entry, and focus moves to it, so the next Tab continues from there.
 * A chapter still waiting to be revealed shows at once, so it lands where it
 * rests.
 */
function goToChapter(id: string): boolean {
  const target = document.getElementById(id);
  if (!target) return false;
  const pending = target.closest<HTMLElement>(".is-pending");
  if (pending) {
    pending.classList.remove("is-pending");
    // Its rise would still be under way while the page scrolls, and the
    // chapter would settle 24 px above its mark: finish it first.
    pending.getBoundingClientRect();
    for (const animation of pending.getAnimations?.() ?? []) {
      animation.finish();
    }
  }
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  window.history.replaceState(window.history.state, "", `#${id}`);
  target.focus({ preventScroll: true });
  return true;
}

export function useChapterNav(ids: readonly string[]) {
  const key = ids.join(" ");
  const order = useMemo(() => (key ? key.split(" ") : []), [key]);
  const [active, setActive] = useState<string | undefined>(undefined);
  const onSection = useCallback((id: string | undefined) => {
    if (id) setActive(id);
  }, []);
  useScrollspy(true, order, onSection);

  const go = useCallback((event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.defaultPrevented || modified(event)) return;
    // The phone contents close first, so the chapter lands where it rests.
    const details = event.currentTarget.closest("details");
    if (details) details.open = false;
    if (!goToChapter(id)) return;
    event.preventDefault();
    setActive(id);
  }, []);

  return { active, go };
}
