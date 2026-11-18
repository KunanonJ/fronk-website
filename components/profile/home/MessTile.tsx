import { Check } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";

/*
 * The About bento's mess tile (profile redesign Phase 3, design spec 8.5):
 * five chips that start scattered, turned and tinted, then tidy into a
 * straight list with violet checks as the tile comes into view, and an
 * italic line under them.
 *
 * The server renders the tidy list, which is also what reduced motion and a
 * page without JavaScript keep. After hydration, a list still below the fold
 * is scattered (`data-state="mess"`) until it is in view; one already on
 * screen stays tidy, so nothing jumps under the reader's eyes. The scattered
 * look lives in CSS under prefers-reduced-motion: no-preference, and each
 * chip's offset is clamped to the tile (home-work-about.css). Its h3 is for
 * assistive technology only (WCAG 1.3.1).
 */

/** Each chip's scatter: px right, px down, degrees. The CSS scales x down on phones. */
const SCATTER = [
  { x: 34, y: 6, r: -6 },
  { x: 120, y: -4, r: 5 },
  { x: 12, y: 10, r: 4 },
  { x: 150, y: -8, r: -8 },
  { x: 70, y: 4, r: 7 },
] as const;

/** The stagger between chips as they tidy, in seconds. */
const STAGGER = 0.08;

export function MessTile({
  heading,
  chips,
  line,
}: {
  heading: string;
  chips: readonly string[];
  line: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (
      !list ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === "undefined" ||
      list.getBoundingClientRect().top < window.innerHeight
    ) {
      return;
    }
    // Scatter at once, out of sight: only the tidying is animated. Reading
    // the layout commits the scattered look before transitions return.
    list.dataset.instant = "";
    list.dataset.state = "mess";
    void list.offsetWidth;
    delete list.dataset.instant;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          list.dataset.state = "tidy";
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(list);
    return () => {
      observer.disconnect();
      list.dataset.state = "tidy";
    };
  }, []);

  return (
    <div className="ds-tile ds-tile--tint pf-bento__tile pf-bento__mess">
      <h3 className="sr-only">{heading}</h3>
      <ul ref={listRef} className="pf-mess" data-state="tidy">
        {chips.map((chip, index) => {
          const scatter = SCATTER[index % SCATTER.length]!;
          const style = {
            "--mx": `${scatter.x}px`,
            "--my": `${scatter.y}px`,
            "--mr": `${scatter.r}deg`,
            "--d": `${(index * STAGGER).toFixed(2)}s`,
          } as CSSProperties;
          return (
            <li key={chip} className="pf-mess__chip" style={style}>
              <span className="pf-mess__check" aria-hidden="true">
                <Check size={13} strokeWidth={3} />
              </span>
              <span>{chip}</span>
            </li>
          );
        })}
      </ul>
      <p className="t-italic pf-mess__line">{line}</p>
    </div>
  );
}
