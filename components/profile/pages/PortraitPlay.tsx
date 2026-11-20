import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Chip } from "@/components/ds/labels";
import { pillClass } from "@/components/ds/Pill";
import { PixelPortrait } from "@/components/profile/site/PixelPortrait";
import {
  PORTRAIT,
  PORTRAIT_TRAITS,
  goldEdition,
  withTrait,
} from "@/lib/brand/pixelPortrait";
import { aboutPageCopy } from "@/lib/content/corePages";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import { cn } from "@/lib/utils/cn";

/*
 * The /about portrait's pixel side (owner, 20-11-26): the pixel portrait lies
 * over the photo. "Photo" dissolves it away through the dither's 16 ranks, the
 * print-in in reverse, and "Pixels" brings it back. Pressing the portrait puts
 * on the next of six traits; each one found is remembered on this device, and
 * finding all six turns the outline gold. A polite line says what was found.
 * The server draws the plain portrait; traits come from storage once the page
 * runs. Under reduced motion the dissolve is a cut.
 */

const TOTAL = PORTRAIT_TRAITS.length;
const FOUND_KEY = "pf-portrait-found";
const WORN_KEY = "pf-portrait-worn";
/** The dissolve: 8 frames of 45 ms, two ranks a frame. */
const FRAME_MS = 45;

interface Saved {
  readonly found: readonly string[];
  readonly worn: string | null;
}

const NOTHING: Saved = { found: [], worn: null };
const listeners = new Set<() => void>();
let cached: { raw: string; saved: Saved } | null = null;

function readSaved(): Saved {
  try {
    const raw = `${localStorage.getItem(FOUND_KEY)}|${localStorage.getItem(WORN_KEY)}`;
    if (cached?.raw === raw) return cached.saved;
    const found = JSON.parse(localStorage.getItem(FOUND_KEY) ?? "[]");
    const saved: Saved = {
      found: Array.isArray(found)
        ? found.filter((id) => PORTRAIT_TRAITS.some((t) => t.id === id))
        : [],
      worn: localStorage.getItem(WORN_KEY),
    };
    cached = { raw, saved };
    return saved;
  } catch {
    return NOTHING;
  }
}

function writeSaved(saved: Saved): void {
  try {
    localStorage.setItem(FOUND_KEY, JSON.stringify(saved.found));
    if (saved.worn) localStorage.setItem(WORN_KEY, saved.worn);
    else localStorage.removeItem(WORN_KEY);
  } catch {
    // Storage blocked: the traits last as long as the page.
    cached = { raw: "", saved };
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function PortraitPlay() {
  const saved = useSyncExternalStore(subscribe, readSaved, () => NOTHING);
  const [photo, setPhoto] = useState(false);
  const [shown, setShown] = useState(16);
  const [news, setNews] = useState("");
  const [pop, setPop] = useState(false);
  const timer = useRef(0);

  const worn = PORTRAIT_TRAITS.find((trait) => trait.id === saved.worn);
  const gold = saved.found.length === TOTAL;
  const rows = gold
    ? goldEdition(withTrait(PORTRAIT, worn))
    : withTrait(PORTRAIT, worn);

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
    const isNew = !saved.found.includes(trait.id);
    const found = isNew ? [...saved.found, trait.id] : [...saved.found];
    writeSaved({ found, worn: trait.id });
    const { portrait } = aboutPageCopy;
    setNews(
      isNew && found.length === TOTAL
        ? portrait.goldFound
        : portrait.found(trait.label, found.length, TOTAL),
    );
    if (isNew) {
      setPop(false);
      window.requestAnimationFrame(() => setPop(true));
    }
  };

  const { portrait } = aboutPageCopy;
  return (
    <>
      <button
        type="button"
        className={cn("pf-about-page__pixels", pop && "is-new")}
        aria-label={portrait.tryTrait(saved.found.length, TOTAL)}
        hidden={photo && shown === 0}
        onClick={nextTrait}
        onAnimationEnd={() => setPop(false)}
      >
        <PixelPortrait rows={rows} shown={shown} />
      </button>
      <div className="pf-about-page__portrait-bar">
        <button
          type="button"
          className={pillClass({ variant: "ghost", size: "sm" })}
          aria-label={photo ? portrait.toPixels : portrait.toPhoto}
          onClick={() => turn(!photo)}
        >
          {photo ? portrait.showPixels : portrait.showPhoto}
        </button>
        <Chip>
          {gold ? portrait.gold : portrait.count(saved.found.length, TOTAL)}
        </Chip>
      </div>
      <p className="sr-only" aria-live="polite">
        {news}
      </p>
    </>
  );
}
