/*
 * The viewer's motion (profile redesign Phase 5, design spec 9.10), with the
 * Web Animations API: the tile grows from its place on the page (a FLIP), the
 * veil fades in, then the caption and the buttons rise in; closing reverses
 * it. Under reduced motion the tile only fades. Engines without the API (and
 * jsdom) skip it: the viewer opens and closes at once.
 */

export interface LightboxParts {
  /** The viewer's tile, at its final size. */
  readonly tile: HTMLElement;
  readonly veil: HTMLElement;
  /** The caption and the buttons, which follow the tile. */
  readonly extras: readonly HTMLElement[];
}

const OPEN_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const CLOSE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/** The transform that puts the final box `to` over the page's box `from`. */
export function flipFrom(
  from: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
  to: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
): string {
  const sx = to.width > 0 ? from.width / to.width : 1;
  const sy = to.height > 0 ? from.height / to.height : 1;
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `translate(${round(from.left - to.left)}px, ${round(
    from.top - to.top,
  )}px) scale(${round(sx)}, ${round(sy)})`;
}

function animatable(el: HTMLElement): boolean {
  return typeof el.animate === "function";
}

async function settled(animations: readonly Animation[]): Promise<void> {
  await Promise.all(animations.map((animation) => animation.finished)).catch(
    () => undefined,
  );
}

/** Plays the opening. `from` is the page tile's box, when it has one. */
export function openLightbox(
  parts: LightboxParts,
  from: DOMRectReadOnly | null,
  reduced: boolean,
): Promise<void> {
  const { tile, veil, extras } = parts;
  if (!animatable(tile)) return Promise.resolve();
  if (reduced || !from) {
    return settled([
      tile.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: "ease-out",
      }),
      veil.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: "ease-out",
      }),
    ]);
  }
  const to = tile.getBoundingClientRect();
  return settled([
    tile.animate([{ transform: flipFrom(from, to) }, { transform: "none" }], {
      duration: 560,
      easing: OPEN_EASE,
    }),
    veil.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 320,
      easing: "ease-out",
    }),
    ...extras.map((el) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 300, delay: 260, easing: "ease-out", fill: "backwards" },
      ),
    ),
  ]);
}

/** Plays the closing; the parts hold their last frame until the dialog closes. */
export function closeLightbox(
  parts: LightboxParts,
  from: DOMRectReadOnly | null,
  reduced: boolean,
): Promise<void> {
  const { tile, veil, extras } = parts;
  if (!animatable(tile)) return Promise.resolve();
  const fade = (el: HTMLElement, duration: number, easing: string) =>
    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing,
      fill: "forwards",
    });
  if (reduced || !from) {
    return settled([
      fade(tile, 160, "ease-in"),
      fade(veil, 160, "ease-in"),
      ...extras.map((el) => fade(el, 160, "ease-in")),
    ]);
  }
  const to = tile.getBoundingClientRect();
  return settled([
    ...extras.map((el) => fade(el, 120, "ease-in")),
    fade(veil, 420, "ease-in"),
    tile.animate([{ transform: "none" }, { transform: flipFrom(from, to) }], {
      duration: 420,
      easing: CLOSE_EASE,
      fill: "forwards",
    }),
  ]);
}
