import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { pillClass } from "@/components/ds/Pill";
import { pixelGaps } from "@/components/landing/patchGaps";
import type {
  pixelBeats,
  pixelCells,
  playBeats,
} from "@/components/profile/site/PixelArt";
import { CASE_PATHS } from "@/lib/content/casePaths";
import { notFoundGameCopy as copy } from "@/lib/content/notFoundGameCopy";
import patchCss from "@/src/styles/patch.css?url";

/*
 * The 404 you fix (now-building-and-genz Phase 6), loaded by the 404 only
 * (components/NotFound.tsx): its drawing arrives with a few pixels missing
 * (components/landing/patchGaps.ts), each gap a real button drawn as a dashed
 * cell. A press fills one with a small pop; "Patch it all" fills the rest.
 * Once whole, the drawing plays the footer drawings' print-in
 * (PixelArt's beats), a polite line says it is fixed, and the Coral cap is
 * found (the toast says so the first time). "I'm feeling lucky" is a real
 * link to a case study picked once the page runs; the server's is
 * /portfolio. Under reduced motion there is no pop and no print-in, only the
 * fill. Focus that was on a gap moves to the next one, then to the lucky
 * link, never to the page's top. The shell hands it the drawing and
 * PixelArt's helpers it already has, so this chunk adds no new ties to the
 * shell's chunk. Styles: src/styles/patch.css, linked here.
 */

/** Both actions under the drawing are small ghost pills. */
const PILL = pillClass({ variant: "ghost", size: "sm" });

/** Where the lucky link goes until the page runs. */
const FALLBACK = "/portfolio";

let picked: string | undefined;
/** A case study at random, the same one for the page's life. */
const luckyCase = () =>
  (picked ??= CASE_PATHS[Math.floor(Math.random() * CASE_PATHS.length)]!);
const never = () => () => {};

/** The same test as lib/motion/motionRuntime, without tying to its chunk. */
const reducedMotion = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;

const keyOf = ({ x, y }: { x: number; y: number }) => `${x}.${y}`;

export interface PatchArtProps {
  /** The drawing (NOT_FOUND_ART). */
  rows: readonly string[];
  cells: typeof pixelCells;
  beats: typeof pixelBeats;
  play: typeof playBeats;
}

export default function PatchArt({ rows, cells, beats, play }: PatchArtProps) {
  const [all] = useState(() => cells(rows));
  const [gaps] = useState(() => pixelGaps(all));
  const [open, setOpen] = useState<ReadonlySet<string>>(
    () => new Set(gaps.map(keyOf)),
  );
  const [news, setNews] = useState("");
  const href = useSyncExternalStore(never, luckyCase, () => FALLBACK);
  const art = useRef<SVGSVGElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const lucky = useRef<HTMLAnchorElement>(null);
  /** Where focus goes after a patch took away what held it. */
  const focusNext = useRef<string | null>(null);

  const total = gaps.length;
  const done = open.size === 0;
  const width = Math.max(0, ...rows.map((row) => row.length));
  const gapKeys = new Set(gaps.map(keyOf));

  /** Patches `keys`; if one held focus, it moves on. */
  const patch = (keys: readonly string[], hadFocus: boolean) => {
    const left = new Set(open);
    keys.forEach((key) => left.delete(key));
    if (hadFocus) {
      const order = gaps.map(keyOf);
      const from = order.indexOf(keys[0] ?? "");
      focusNext.current =
        [...order.slice(from + 1), ...order.slice(0, from)].find((key) =>
          left.has(key),
        ) ?? "lucky";
    }
    setOpen(left);
    setNews(
      left.size === 0 ? copy.fixed : copy.progress(total - left.size, total),
    );
  };

  useEffect(() => {
    const next = focusNext.current;
    focusNext.current = null;
    if (!next) return;
    (next === "lucky" ? lucky.current : buttons.current.get(next))?.focus();
  }, [open]);

  // Whole again: the print-in plays and the cap is found.
  useEffect(() => {
    if (!done) return;
    const svg = art.current;
    if (svg && typeof svg.animate === "function" && !reducedMotion()) {
      play(svg, beats(rows));
    }
    void import("@/lib/brand/traitStore").then((store) =>
      store.award("cap", "notfound"),
    );
  }, [done, play, beats, rows]);

  return (
    <>
      <link rel="stylesheet" href={patchCss} precedence="pf-patch" />
      <div
        className="pf-patch"
        style={{ "--w": width, "--h": rows.length } as CSSProperties}
      >
        <svg
          ref={art}
          className="pf-art pf-patch__art"
          viewBox={`0 0 ${width} ${rows.length}`}
          aria-hidden="true"
          focusable="false"
          shapeRendering="crispEdges"
        >
          {all.map((cell) => {
            const key = keyOf(cell);
            if (open.has(key)) return null;
            const fill = gapKeys.has(key) ? " pf-patch__fill" : "";
            return (
              <rect
                key={key}
                x={cell.x}
                y={cell.y}
                width={1}
                height={1}
                className={`pf-px pf-px--${cell.tone}${fill}`}
              />
            );
          })}
        </svg>
        {gaps.map((gap, at) => {
          const key = keyOf(gap);
          return open.has(key) ? (
            <button
              key={key}
              ref={(el) => {
                if (el) buttons.current.set(key, el);
                else buttons.current.delete(key);
              }}
              type="button"
              className="pf-patch__gap"
              style={{ "--x": gap.x, "--y": gap.y } as CSSProperties}
              aria-label={copy.gap(at + 1, total)}
              onClick={(event) =>
                patch([key], event.currentTarget === document.activeElement)
              }
            />
          ) : null;
        })}
      </div>
      <div className="pf-patch__bar">
        {done ? null : (
          <button
            type="button"
            className={PILL}
            onClick={(event) =>
              patch([...open], event.currentTarget === document.activeElement)
            }
          >
            {copy.all}
          </button>
        )}
        <a ref={lucky} href={href} className={PILL}>
          {copy.lucky}
        </a>
      </div>
      <p className="pf-patch__news" aria-live="polite">
        {news || copy.hint}
      </p>
    </>
  );
}
