import { useCallback, useEffect, useRef, type CSSProperties } from "react";
import { SectionHeader } from "@/components/profile/home/SectionHeader";
import { StackCard } from "@/components/profile/home/StackCard";
import {
  restingScrollTop,
  stackDepths,
} from "@/components/profile/home/stackDepth";
import { workCopy } from "@/lib/content/homeWorkAbout";
import { stackCards } from "@/lib/landing/stackCards";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import { returnedTo, useAfterNavigation } from "@/lib/router/navigation";
import { onVisitorScroll } from "@/lib/router/visitorScroll";

/*
 * The work stack (profile redesign Phase 3, design spec 8.4): an article
 * named "Selected work" by its eyebrow (a smoke test reads that name), and a
 * list of case cards that stick under the nav, each 14 px lower than the one
 * before, so later cards slide over earlier ones.
 *
 * Small scripts, all progressive: the page is complete without them.
 * - Depth: on scroll, each card learns how far later cards cover it
 *   (`--depth`), and CSS scales it back and veils it. Not under reduced
 *   motion, where the cards still stack but never scale.
 * - Focus (WCAG 2.4.11): once the browser has scrolled a keyboard-focused
 *   card link into view, a link the next card covers, or one not wholly on
 *   screen, scrolls the page until its card rests uncovered.
 * - Anchors: a jump to #ventures (the GoGoCash card) lands where the list
 *   says the card rests. The browser and the router measure a stuck card
 *   where it is stuck, so from inside or below the stack they miss. Back,
 *   Forward and a reload keep the place the router puts back.
 * Stacking itself is CSS, and only on screens tall enough to show a whole
 * card below the nav (`.pf-stack__item` in home-work-about.css).
 */

/** Each card sticks this much lower than the one before it (spec 8.4). */
const STEP = 14;

/** The card's id that /#ventures lands on (the GoGoCash card, umbrella R7). */
const VENTURES = "ventures";

const CARDS = stackCards();

function itemsOf(list: HTMLElement): HTMLElement[] {
  return [...list.children] as HTMLElement[];
}

/** True while the items stick; on short screens they simply follow each other. */
function sticks(items: readonly HTMLElement[]): boolean {
  return items.length > 0 && getComputedStyle(items[0]!).position === "sticky";
}

function behavior(): ScrollBehavior {
  return prefersReducedMotion() ? "instant" : "smooth";
}

/** Scrolls the page until card `index` rests at its sticky top, uncovered. */
function scrollToRest(
  list: HTMLElement,
  items: readonly HTMLElement[],
  index: number,
) {
  const top = restingScrollTop({
    listTop: list.getBoundingClientRect().top + window.scrollY,
    // Fractional heights: offsetHeight rounds, and the error adds up.
    heights: items.map((each) => each.getBoundingClientRect().height),
    gap: parseFloat(getComputedStyle(list).rowGap) || 0,
    index,
    stickyTop: parseFloat(getComputedStyle(items[index]!).top) || 0,
  });
  window.scrollTo({ top, behavior: behavior() });
}

/** Lands the card carrying `id` where it rests, when the stack sticks. */
function landOn(list: HTMLElement, id: string) {
  const items = itemsOf(list);
  const index = items.findIndex((item) => item.firstElementChild?.id === id);
  if (index >= 0 && sticks(items)) scrollToRest(list, items, index);
}

/** Keyboard focus, not a click: only it calls for scrolling (WCAG 2.4.11). */
function focusVisible(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

export default function WorkStack() {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = itemsOf(list);
    const cards = items.map((item) => item.firstElementChild as HTMLElement);

    let frame = 0;
    const update = () => {
      frame = 0;
      const box = list.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      const depths = sticks(items)
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

    // The check waits a frame: focus events fire before the browser scrolls
    // the focused link into view, and that scroll can leave it under the
    // next card (or, while smooth, still on its way).
    let focusFrame = 0;
    const onFocus = (event: FocusEvent) => {
      const link = event.target as Element;
      cancelAnimationFrame(focusFrame);
      focusFrame = requestAnimationFrame(() => {
        focusFrame = 0;
        if (document.activeElement !== link || !focusVisible(link)) return;
        const item = link.closest(".pf-stack__item");
        const index = item ? items.indexOf(item as HTMLElement) : -1;
        const next = items[index + 1];
        if (index < 0 || !next || !sticks(items)) return;
        const box = link.getBoundingClientRect();
        // The bar's scroll padding is the top of the clear area.
        const clear =
          parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop,
          ) || 0;
        const covered =
          // The next card has slid over this one's lower edge.
          next.getBoundingClientRect().top <
            items[index]!.getBoundingClientRect().bottom - 1 ||
          // Or the link is not wholly on screen.
          box.top < clear ||
          box.bottom > window.innerHeight;
        if (covered) scrollToRest(list, items, index);
      });
    };
    list.addEventListener("focusin", onFocus);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      list.removeEventListener("focusin", onFocus);
      for (const card of cards) card.style.removeProperty("--depth");
    };
  }, []);

  // A page opened at /#ventures, fresh or by a link from another page: the
  // browser or the router has jumped already, measured before the fonts
  // settled (and in WebKit, smoothly, maybe not all the way), so the card
  // is placed again once they have. Not when Back, Forward or a reload
  // brought the visitor back, where the router has put the page back where
  // it was, and not once the visitor has scrolled.
  useEffect(() => {
    const list = listRef.current;
    if (!list || window.location.hash !== `#${VENTURES}` || returnedTo()) {
      return;
    }
    let live = true;
    const stop = onVisitorScroll(() => {
      live = false;
    });
    const fonts = (document as { fonts?: FontFaceSet }).fonts;
    void (fonts?.ready ?? Promise.resolve()).then(() => {
      stop();
      if (live && window.location.hash === `#${VENTURES}`) {
        landOn(list, VENTURES);
      }
    });
    return () => {
      live = false;
      stop();
    };
  }, []);

  // A link in the app to #ventures, on Home: the router has just scrolled
  // to the card as it stands; place it again. Back and Forward keep the
  // place the router put back.
  const onNavigated = useCallback((hash: string) => {
    const list = listRef.current;
    if (list && hash === VENTURES && !returnedTo()) landOn(list, VENTURES);
  }, []);
  useAfterNavigation(onNavigated);

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
