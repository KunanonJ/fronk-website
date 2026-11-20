import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { pillClass } from "@/components/ds/Pill";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import { PORTRAIT, PORTRAIT_COLOURS } from "@/lib/brand/pixelPortrait";
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
 *
 * Phase 6 (now-building-and-genz), both loaded on first use and neither
 * shown at rest:
 * - Save my edition: once a trait is found, a round button in the bottom
 *   corner, clear of the social links, saves the portrait as worn as a PNG
 *   (./portraitEdition.ts, loaded on its first hover, focus or press); on a
 *   touch device that can share files it shares instead.
 * - The holo card: with a fine pointer, motion allowed and no forced
 *   colours, the first mouse over the portrait loads ./PortraitHolo.tsx,
 *   which tilts the card toward the pointer under a foil sheen.
 */

const TOTAL = PORTRAIT_TRAITS.length;
/** The dissolve: 8 frames of 45 ms, two ranks a frame. */
const FRAME_MS = 45;

const PortraitHolo = lazy(
  () => import("@/components/profile/pages/PortraitHolo"),
);
const loadEdition = () => import("@/components/profile/pages/portraitEdition");

/** In the bottom corner, centred on the social links' row, clear of them. */
const SAVE_SPOT: CSSProperties = {
  position: "absolute",
  insetBlockEnd: 26,
  insetInlineEnd: 16,
};

const media = (query: string) =>
  typeof window !== "undefined" &&
  (window.matchMedia?.(query).matches ?? false);

/** The holo card's conditions: a mouse that hovers, motion, real colours. */
export function holoAllowed(): boolean {
  return (
    media("(hover: hover) and (pointer: fine)") &&
    !prefersReducedMotion() &&
    !media("(forced-colors: active)")
  );
}

/** A touch device that can share a PNG (the Web Share API, level 2). */
function canShareFiles(): boolean {
  try {
    return (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      media("(pointer: coarse)") &&
      navigator.canShare({
        files: [new File([""], "edition.png", { type: "image/png" })],
      })
    );
  } catch {
    return false;
  }
}

/** Download, or share, as a line icon (the icon set's would tie the chunk). */
function SaveIcon({ share }: { share: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={
          share
            ? "M12 15V3M8 7l4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"
            : "M12 4v11M7 10l5 5 5-5M5 20h14"
        }
      />
    </svg>
  );
}

export function PortraitPlay() {
  const saved = useSyncExternalStore(subscribeTraits, readTraits, serverTraits);
  const [photo, setPhoto] = useState(false);
  const [shown, setShown] = useState(16);
  const [news, setNews] = useState("");
  const [pop, setPop] = useState(false);
  const [holo, setHolo] = useState(false);
  const [share] = useState(canShareFiles);
  const timer = useRef(0);
  const pixels = useRef<HTMLDivElement>(null);

  const found = saved.found.length;
  const gold = found === TOTAL;
  const rows = wornPortrait(PORTRAIT, saved.worn, found);

  useEffect(() => () => window.clearInterval(timer.current), []);

  // The first mouse over the card loads the holo, where it is allowed (a
  // move, not an enter: a pointer already resting there counts too).
  useEffect(() => {
    const card = pixels.current?.parentElement;
    if (holo || !card || !holoAllowed()) return;
    const wake = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setHolo(true);
    };
    card.addEventListener("pointermove", wake);
    return () => card.removeEventListener("pointermove", wake);
  }, [holo]);

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
    const now = readTraits().found.length;
    const { portrait } = aboutPageCopy;
    setNews(
      isNew && now === TOTAL
        ? portrait.goldFound
        : portrait.found(trait.label, now, TOTAL),
    );
    if (isNew) {
      setPop(false);
      window.requestAnimationFrame(() => setPop(true));
    }
  };

  /** Saves the portrait as worn, on the page's own background. */
  const saveEdition = async () => {
    const { portrait } = aboutPageCopy;
    const bg = pixels.current?.querySelector(".pf-portrait__bg");
    const fill = bg ? getComputedStyle(bg).fill : "";
    try {
      const edition = await loadEdition();
      const result = await edition.saveEdition(
        {
          rows,
          colours: PORTRAIT_COLOURS,
          background: fill && fill !== "none" ? fill : PORTRAIT_COLOURS.a,
          stamp: portrait.stamp(found, TOTAL),
        },
        share,
      );
      if (result !== "cancelled") {
        setNews(
          result === "shared" ? portrait.shared : portrait.saved(found, TOTAL),
        );
      }
    } catch {
      setNews(portrait.saveFailed);
    }
  };

  const { portrait } = aboutPageCopy;
  return (
    <>
      {/* A pointer's shortcut to "Try a trait"; the button is the way in. */}
      <div
        ref={pixels}
        className={cn("pf-about-page__pixels", pop && "is-new")}
        hidden={photo && shown === 0}
        onClick={nextTrait}
        onAnimationEnd={() => setPop(false)}
      >
        <PixelPortrait rows={rows} shown={shown} />
      </div>
      {holo ? (
        <Suspense fallback={null}>
          <PortraitHolo />
        </Suspense>
      ) : null}
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
          {gold ? portrait.gold(TOTAL) : portrait.tryTrait(found, TOTAL)}
        </button>
      </div>
      {found > 0 ? (
        <button
          type="button"
          className={pillClass({ variant: "ghost", size: "sm", round: true })}
          style={SAVE_SPOT}
          aria-label={share ? portrait.share : portrait.save}
          onPointerEnter={() => void loadEdition()}
          onFocus={() => void loadEdition()}
          onClick={() => void saveEdition()}
        >
          <SaveIcon share={share} />
        </button>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {news}
      </p>
    </>
  );
}
