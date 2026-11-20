import { useEffect, useRef } from "react";
import holoCss from "@/src/styles/holo.css?url";

/*
 * The holo card (now-building-and-genz Phase 6), loaded by /about's portrait
 * (PortraitPlay) the first time a mouse comes over it, and only where a fine
 * pointer hovers, motion is allowed and colours are not forced. The card
 * (.pf-about-page__portrait, this sheen's parent) tilts a few degrees toward
 * the pointer and a foil sheen follows it; on leave the card eases back flat
 * and the sheen fades. The pointer's place goes to CSS as custom properties
 * (--holo-x, --holo-y, --holo-rx, --holo-ry) on the card, and the card's
 * `data-holo` says whether the pointer is on it. The sheen sits over the
 * pixels and under the portrait's controls, which stay above it, so it
 * covers no text; it takes no pointer, so a press still tries a trait.
 * Styles: src/styles/holo.css, linked here; flat again under reduced
 * motion, forced colours or a coarse pointer, whatever this script sees.
 */

/** The tilt at the card's edge, in degrees. */
const TILT = 6;

const PROPERTIES = ["--holo-x", "--holo-y", "--holo-rx", "--holo-ry"];

/** `n` held between 0 and 1. */
const unit = (n: number) => Math.min(1, Math.max(0, n));

export default function PortraitHolo() {
  const sheen = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const card = sheen.current?.parentElement;
    if (!card) return;
    const set = (name: string, value: string) =>
      card.style.setProperty(name, value);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = card.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const x = unit((event.clientX - box.left) / box.width);
      const y = unit((event.clientY - box.top) / box.height);
      set("--holo-x", `${(x * 100).toFixed(1)}%`);
      set("--holo-y", `${(y * 100).toFixed(1)}%`);
      set("--holo-rx", `${((0.5 - y) * 2 * TILT).toFixed(2)}deg`);
      set("--holo-ry", `${((x - 0.5) * 2 * TILT).toFixed(2)}deg`);
      card.dataset.holo = "on";
    };
    const leave = () => {
      set("--holo-rx", "0deg");
      set("--holo-ry", "0deg");
      card.dataset.holo = "off";
    };
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", leave);
    return () => {
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerleave", leave);
      delete card.dataset.holo;
      PROPERTIES.forEach((name) => card.style.removeProperty(name));
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href={holoCss} precedence="pf-holo" />
      <span ref={sheen} className="pf-holo" aria-hidden="true" />
    </>
  );
}
