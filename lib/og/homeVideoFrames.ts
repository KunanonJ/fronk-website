import { createHash } from "node:crypto";
import { render } from "@cf-wasm/og";
import { createElement } from "react";
import { bayerRank } from "@/components/ds/ditherCells";
import { brand } from "@/lib/brand/tokens";
import { PORTRAIT, PORTRAIT_COLOURS } from "@/lib/brand/pixelPortrait";
import { INTRO_RANKS, INTRO_TIMING } from "@/lib/content/introGreetings";
import { OG_SIZE } from "@/lib/og/card";
import { PORTRAIT_BOX, ProfileCard } from "@/lib/og/profileCard";
import { HOME_CARD } from "@/lib/og/profileCards";
import { ogRenderOptions } from "@/lib/og/render";
import source from "./homeVideoFrames.ts?raw";

/*
 * Home's og:video (owner, 21-11-26): the share card coming alive. Frame 0 is
 * the og:image itself (/opengraph-image, rendered here with the same card,
 * fonts and renderer). Then the portrait mints: the pixel portrait
 * (lib/brand/pixelPortrait.ts) prints in over the photo by the dither's 16
 * ranks, one rank every 100 ms as in the first-visit intro, holds, and
 * dissolves back to the photo through the ranks in reverse, as /about's
 * portrait does; the loop ends on the still it starts with, so it is seamless.
 *
 * Two renders make every frame: the card as it is (the still) and the card
 * with the pixel portrait in the photo's box (the minted card). A frame takes
 * each of the portrait's cells from one or the other, by the cell's rank, so
 * the motion is exact pixels from the card's own renderer and nothing else on
 * the card moves. Node only: scripts/og-video.mjs encodes the frames, and
 * homeVideoFrames.test.ts checks the committed video's fingerprint in CI,
 * where there is no ffmpeg.
 */

export const HOME_VIDEO_FPS = 30;

/** One print rank, as the intro prints the portrait. */
const STEP_MS = INTRO_TIMING.printStepMs;
const PRINT_MS = INTRO_RANKS * STEP_MS;
/** The still before the portrait mints, the minted hold, the still after. */
const LEAD_MS = 800;
const HOLD_MS = 1000;
const TAIL_MS = 1000;
const DISSOLVE_AT_MS = LEAD_MS + PRINT_MS + HOLD_MS;

export const HOME_VIDEO_MS = DISSOLVE_AT_MS + PRINT_MS + TAIL_MS;
export const HOME_VIDEO_FRAMES = (HOME_VIDEO_MS * HOME_VIDEO_FPS) / 1000;

/**
 * H.264 for every player that plays a link preview's video: 4:2:0, BT.709
 * (converted and tagged, so players read the colours as they were drawn),
 * no audio track, and the index at the front so playback starts before the
 * file is whole (Apple TN3156: Messages downloads an og:video MPEG-4 file
 * and plays it; https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages).
 */
const HOME_VIDEO_ENCODER: readonly string[] = [
  "-vf",
  [
    "scale=out_color_matrix=bt709:out_range=tv",
    "format=yuv420p",
    // The tags travel on the frames: raw RGB in has none to carry.
    "setparams=colorspace=bt709:color_primaries=bt709:color_trc=bt709:range=tv",
  ].join(","),
  "-c:v",
  "libx264",
  "-preset",
  "veryslow",
  "-crf",
  "18",
  "-an",
  "-movflags",
  "+faststart",
];

/**
 * The owner's ceiling for the file, well inside the 10 MB Messages allows
 * for all of a preview's images and videos together (TN3156).
 */
export const HOME_VIDEO_MAX_BYTES = 2 * 1024 * 1024;

/**
 * How many of the pixel portrait's 16 ranks a frame shows: 0 is the photo
 * (the og:image), 16 the whole pixel portrait. Integer arithmetic, so a
 * frame's state never depends on rounding.
 */
export function ranksShown(frame: number): number {
  const at = frame * 1000; // ms x fps
  const step = STEP_MS * HOME_VIDEO_FPS;
  const mint = at - LEAD_MS * HOME_VIDEO_FPS;
  if (mint < 0) return 0;
  const dissolve = at - DISSOLVE_AT_MS * HOME_VIDEO_FPS;
  if (dissolve < 0) return Math.min(INTRO_RANKS, Math.floor(mint / step) + 1);
  return Math.max(0, INTRO_RANKS - 1 - Math.floor(dissolve / step));
}

/** One of the portrait's cells on the card, in pixels, with its print rank. */
interface Cell {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly key: string;
  readonly rank: number;
}

/**
 * The pixel portrait laid over the photo's box: its 24 columns across the
 * box, square cells, and background rows above the drawing to fill the box's
 * height (the drawing's shoulders meet the box's foot, as the photo's do).
 * Cell edges are whole pixels. Ranks are the drawing's own (portraitCells).
 */
export function portraitGrid(): Cell[] {
  const { width, height } = PORTRAIT_BOX;
  const cols = PORTRAIT[0]!.length;
  const rows = Math.round(height / (width / cols));
  const pad = rows - PORTRAIT.length;
  const left = OG_SIZE.width - PORTRAIT_BOX.right - width;
  const xs = Array.from({ length: cols + 1 }, (_, i) =>
    Math.round((i * width) / cols),
  );
  const ys = Array.from({ length: rows + 1 }, (_, j) =>
    Math.round((j * height) / rows),
  );
  const cells: Cell[] = [];
  for (let row = 0; row < rows; row += 1) {
    const y = row - pad;
    for (let col = 0; col < cols; col += 1) {
      cells.push({
        left: left + xs[col]!,
        top: PORTRAIT_BOX.top + ys[row]!,
        width: xs[col + 1]! - xs[col]!,
        height: ys[row + 1]! - ys[row]!,
        key: y < 0 ? "." : PORTRAIT[y]![col]!,
        rank: bayerRank(col, ((y % 4) + 4) % 4),
      });
    }
  }
  return cells;
}

/**
 * The pixel portrait as an SVG the size of the photo's box, one path per
 * colour: the background takes the accent, as `--portrait-bg` does on the
 * site.
 */
function pixelPortraitDataUrl(cells: readonly Cell[]): string {
  const left = OG_SIZE.width - PORTRAIT_BOX.right - PORTRAIT_BOX.width;
  const paths = new Map<string, string[]>();
  for (const cell of cells) {
    const list = paths.get(cell.key) ?? [];
    list.push(
      `M${cell.left - left} ${cell.top - PORTRAIT_BOX.top}h${cell.width}v${cell.height}h-${cell.width}z`,
    );
    paths.set(cell.key, list);
  }
  const fill = (key: string) =>
    key === "."
      ? brand.accent
      : PORTRAIT_COLOURS[key as keyof typeof PORTRAIT_COLOURS];
  const shapes = [...paths]
    .map(([key, d]) => `<path fill="${fill(key)}" d="${d.join("")}"/>`)
    .join("");
  const { width, height } = PORTRAIT_BOX;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">${shapes}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** A card render: its PNG (what /opengraph-image serves) and its RGBA pixels. */
async function renderCard(portrait?: string) {
  const element = createElement(ProfileCard, { ...HOME_CARD, portrait });
  const { image, pixels } = await render(element, ogRenderOptions()).asPng();
  return { png: image, pixels };
}

const sha256 = (data: string | Uint8Array) =>
  createHash("sha256").update(data).digest("hex");

/** RGBA to RGB: the card is opaque, the encoder reads rgb24. */
function toRgb(rgba: Uint8Array): Uint8Array {
  const rgb = new Uint8Array((rgba.length / 4) * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i]!;
    rgb[j + 1] = rgba[i + 1]!;
    rgb[j + 2] = rgba[i + 2]!;
  }
  return rgb;
}

export interface HomeVideoSource {
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  /** How many frames the loop has. */
  readonly count: number;
  /** ffmpeg's output options for the frames (rgb24 in, MP4 out). */
  readonly encoder: readonly string[];
  /** The og:image's PNG, as /opengraph-image serves it. */
  readonly stillPng: Uint8Array;
  /** Frame `index` as rgb24, `width` x `height`. */
  frame(index: number): Uint8Array;
  /**
   * What the video is made from: both renders' pixels, the cells and their
   * ranks, the timeline, the encoder's settings and this file. The committed
   * video records it; when it no longer matches, the video is stale.
   */
  readonly fingerprint: string;
}

/** Renders the two cards and returns the frames and their fingerprint. */
export async function homeVideoSource(): Promise<HomeVideoSource> {
  const { width, height } = OG_SIZE;
  const cells = portraitGrid();
  const still = await renderCard();
  const minted = await renderCard(pixelPortraitDataUrl(cells));

  // Only the portrait's box may differ, or the frames would cut the card.
  const box = {
    left: OG_SIZE.width - PORTRAIT_BOX.right - PORTRAIT_BOX.width,
    top: PORTRAIT_BOX.top,
  };
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const inside =
        x >= box.left &&
        x < box.left + PORTRAIT_BOX.width &&
        y >= box.top &&
        y < box.top + PORTRAIT_BOX.height;
      if (inside) continue;
      const at = (y * width + x) * 4;
      for (let c = 0; c < 4; c += 1) {
        if (still.pixels[at + c] !== minted.pixels[at + c])
          throw new Error(
            `the minted card differs outside the portrait at ${x},${y}`,
          );
      }
    }
  }

  const stillRgb = toRgb(still.pixels);
  const mintedRgb = toRgb(minted.pixels);
  const timeline = Array.from({ length: HOME_VIDEO_FRAMES }, (_, f) =>
    ranksShown(f),
  );

  const frame = (index: number) => {
    const out = stillRgb.slice();
    const shown = ranksShown(index);
    for (const cell of cells) {
      if (cell.rank >= shown) continue;
      for (let y = cell.top; y < cell.top + cell.height; y += 1) {
        const from = (y * width + cell.left) * 3;
        out.set(mintedRgb.subarray(from, from + cell.width * 3), from);
      }
    }
    return out;
  };

  const fingerprint = sha256(
    JSON.stringify({
      size: OG_SIZE,
      fps: HOME_VIDEO_FPS,
      timeline,
      cells,
      still: sha256(still.pixels),
      minted: sha256(minted.pixels),
      encoder: HOME_VIDEO_ENCODER,
      source: sha256(source),
    }),
  );

  return {
    width,
    height,
    fps: HOME_VIDEO_FPS,
    count: HOME_VIDEO_FRAMES,
    encoder: HOME_VIDEO_ENCODER,
    stillPng: still.png,
    frame,
    fingerprint,
  };
}
