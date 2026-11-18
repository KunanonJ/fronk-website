import { useEffect, useRef, type CSSProperties } from "react";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { StackCard } from "@/components/profile/home/StackCard";
import {
  restingScrollTop,
  stackDepths,
} from "@/components/profile/home/stackDepth";
import { workCopy } from "@/lib/content/homeWorkAbout";
import { stackCards } from "@/lib/landing/stackCards";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * The work stack (profile redesign Phase 3, design spec 8.4): an article
 * named "Selected work" by its eyebrow (a smoke test reads that name), and a
 * list of case cards that stick under the nav, each 14 px lower than the one
 * before, so later cards slide over earlier ones.
 *
 * Two small scripts, both progressive: the page is complete without them.
 * - Depth: on scroll, each card learns how far later cards cover it
 *   (`--depth`), and CSS scales it back and veils it. Not under reduced
 *   motion, where the cards still stack but never scale.
 * - Focus (WCAG 2.4.11): a link that takes focus inside a covered card
 *   scrolls the page until that card rests uncovered.
 * Stacking itself is CSS, and only on screens tall enough to show a whole
 * card below the nav (`.pf-stack__item` in home-work-about.css).
 */

/** Each card sticks this much lower than the one before it (spec 8.4). */
const STEP = 14;

const CARDS = stackCards();

export default function WorkStack() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = [...list.children] as HTMLElement[];
    const cards = items.map((item) => item.firstElementChild as HTMLElement);
    const stuck = () =>
      items.length > 0 && getComputedStyle(items[0]!).position === "sticky";

    let frame = 0;
    const update = () => {
      frame = 0;
      const box = list.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const depths = stuck()
        ? stackDepths(
            items.map((item) => item.getBoundingClientRect()),
            STEP,
          )
        : items.map(() => 0);
      cards.forEach((card, i) =>
        card.style.setProperty("--depth", depths[i]!.toFixed(3)),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const depth = !prefersReducedMotion();
    if (depth) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    }

    const onFocus = (event: FocusEvent) => {
      const item = (event.target as Element).closest(".pf-stack__item");
      const index = item ? items.indexOf(item as HTMLElement) : -1;
      const next = items[index + 1];
      if (index < 0 || !next || !stuck()) return;
      // Covered when the next card has slid over this one's lower edge.
      if (
        next.getBoundingClientRect().top >=
        items[index]!.getBoundingClientRect().bottom - 1
      ) {
        return;
      }
      const top = restingScrollTop({
        listTop: list.getBoundingClientRect().top + window.scrollY,
        // Fractional heights: offsetHeight rounds, and the error adds up.
        heights: items.map((each) => each.getBoundingClientRect().height),
        gap: parseFloat(getComputedStyle(list).rowGap) || 0,
        index,
        stickyTop: parseFloat(getComputedStyle(items[index]!).top) || 0,
      });
      window.scrollTo({
        top,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    };
    list.addEventListener("focusin", onFocus);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      list.removeEventListener("focusin", onFocus);
      for (const card of cards) card.style.removeProperty("--depth");
    };
  }, []);

  return (
    <article
      id="work"
      aria-labelledby="work-eyebrow"
      className="pf-work ds-wrap"
    >
      <SectionHeader
        eyebrow={workCopy.eyebrow}
        eyebrowId="work-eyebrow"
        title={workCopy.heading}
        titleId="work-title"
        lead={workCopy.lead}
      />
      <ul ref={listRef} className="pf-stack">
        {CARDS.map((card, index) => (
          <li
            key={card.slug}
            className="pf-stack__item"
            style={{ "--i": index } as CSSProperties}
          >
            <StackCard card={card} index={index} />
          </li>
        ))}
      </ul>
    </article>
  );
}
