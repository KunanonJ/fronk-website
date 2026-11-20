import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { pillClass } from "@/components/ds/Pill";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { PORTRAIT } from "@/lib/brand/pixelPortrait";
import { PORTRAIT_TRAITS, wornPortrait } from "@/lib/brand/portraitTraits";
import {
  award,
  readTraits,
  serverTraits,
  subscribeTraits,
  wear,
} from "@/lib/brand/traitStore";
import { aboutPageCopy } from "@/lib/content/corePages";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import { cn } from "@/lib/utils/cn";

/*
 * The /about portrait's pixel side (owner, 20-11-26): the pixel portrait lies
 * over the photo. "Photo" dissolves it away through the dither's 16 ranks, the
 * print-in in reverse, and "Pixels" brings it back. "Try a trait" puts on the
 * next of six traits (a press on the portrait does too, for a pointer: like a
 * showcase tile, the portrait is not a control itself, so it overlaps no other
 * target); each one found is remembered on this device, and finding all six
 * turns the outline gold. A polite line says what was found. The traits are
 * the visitor's across the site (lib/brand/traitStore.ts): the nav's avatar
 * wears the same one, and some are found elsewhere.
 * The server draws the plain portrait; traits come from storage once the page
 * runs. Under reduced motion the dissolve is a cut.
 */

const TOTAL = PORTRAIT_TRAITS.length;
/** The dissolve: 8 frames of 45 ms, two ranks a frame. */
const FRAME_MS = 45;

export function PortraitPlay() {
  const saved = useSyncExternalStore(subscribeTraits, readTraits, serverTraits);
  const [photo, setPhoto] = useState(false);
  const [shown, setShown] = useState(16);
  const [news, setNews] = useState("");
  const [pop, setPop] = useState(false);
  const timer = useRef(0);

  const gold = saved.found.length === TOTAL;
  const rows = wornPortrait(PORTRAIT, saved.worn, saved.found.length);

  useEffect(() => () => window.clearInterval(timer.current), []);

  /** Shows the photo or the pixels, through the dither's ranks. */
  const turn = (toPhoto: boolean) => {
    setPhoto(toPhoto);
    window.clearInterval(timer.current);
    const target = toPhoto ? 0 : 16;
    if (prefersReducedMotion()) {
      setShown(target);
      return;
    }
    timer.current = window.setInterval(() => {
      setShown((now) => {
        const next = toPhoto ? Math.max(0, now - 2) : Math.min(16, now + 2);
        if (next === target) window.clearInterval(timer.current);
        return next;
      });
    }, FRAME_MS);
  };

  /** Puts on the next trait, and remembers it as found. */
  const nextTrait = () => {
    const at = PORTRAIT_TRAITS.findIndex((trait) => trait.id === saved.worn);
    const trait = PORTRAIT_TRAITS[(at + 1) % TOTAL]!;
    // Found here, the line below says so (no toast); one found before goes on.
    const isNew = award(trait.id, "about");
    if (!isNew) wear(trait.id);
    const found = readTraits().found.length;
    const { portrait } = aboutPageCopy;
    setNews(
      isNew && found === TOTAL
        ? portrait.goldFound
        : portrait.found(trait.label, found, TOTAL),
    );
    if (isNew) {
      setPop(false);
      window.requestAnimationFrame(() => setPop(true));
    }
  };

  const { portrait } = aboutPageCopy;
  return (
    <>
      {/* A pointer's shortcut to "Try a trait"; the button is the way in. */}
      <div
        className={cn("pf-about-page__pixels", pop && "is-new")}
        hidden={photo && shown === 0}
        onClick={nextTrait}
        onAnimationEnd={() => setPop(false)}
      >
        <PixelPortrait rows={rows} shown={shown} />
      </div>
      <div className="pf-about-page__portrait-bar">
        <button
          type="button"
          className={pillClass({ variant: "ghost", size: "sm" })}
          aria-label={photo ? portrait.toPixels : portrait.toPhoto}
          onClick={() => turn(!photo)}
        >
          {photo ? portrait.showPixels : portrait.showPhoto}
        </button>
        <button
          type="button"
          className={pillClass({ variant: "ghost", size: "sm" })}
          onClick={nextTrait}
        >
          {gold
            ? portrait.gold(TOTAL)
            : portrait.tryTrait(saved.found.length, TOTAL)}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {news}
      </p>
    </>
  );
}
