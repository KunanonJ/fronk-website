import { describe, expect, it, vi } from "vitest";
import { bayerRank } from "@/components/ds/ditherCells";

// The card prints the site's domain; render it as production serves it.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://kunanonj.com";
});
import { INTRO_RANKS } from "@/lib/content/introGreetings";
import { OG_SIZE } from "@/lib/og/card";
import { inputs } from "@/lib/og/homeVideo.json";
import {
  HOME_VIDEO_FPS,
  HOME_VIDEO_FRAMES,
  HOME_VIDEO_MS,
  homeVideoSource,
  portraitGrid,
  ranksShown,
} from "@/lib/og/homeVideoFrames";
import { PORTRAIT_BOX } from "@/lib/og/profileCard";

/*
 * Home's og:video frames (lib/og/homeVideoFrames.ts). The fingerprint test
 * is `pnpm og:video --check` without ffmpeg: it renders the card as the
 * og:image route does and fails when the committed video was made from
 * anything else.
 */

describe("Home's og:video timeline", () => {
  const timeline = Array.from({ length: HOME_VIDEO_FRAMES }, (_, f) =>
    ranksShown(f),
  );

  it("loops in six seconds at 30 frames a second", () => {
    expect(HOME_VIDEO_FPS).toBe(30);
    expect(HOME_VIDEO_MS).toBe(6000);
    expect(HOME_VIDEO_FRAMES).toBe(180);
  });

  it("starts and ends on the still, so the loop has no seam", () => {
    expect(timeline.slice(0, 24).every((shown) => shown === 0)).toBe(true);
    expect(timeline.slice(-30).every((shown) => shown === 0)).toBe(true);
  });

  it("mints one rank every 100 ms, holds the whole portrait, then dissolves", () => {
    const peak = timeline.indexOf(INTRO_RANKS);
    const last = timeline.lastIndexOf(INTRO_RANKS);
    expect(peak).toBeGreaterThan(0);
    expect(last - peak).toBeGreaterThanOrEqual(30);
    for (let f = 1; f < HOME_VIDEO_FRAMES; f += 1) {
      const step = timeline[f]! - timeline[f - 1]!;
      expect(Math.abs(step)).toBeLessThanOrEqual(1);
      expect(step).toBe(f <= peak ? Math.max(step, 0) : Math.min(step, 0));
    }
    // 100 ms is three frames at 30 fps.
    expect(timeline.filter((shown) => shown === 8)).toHaveLength(6);
  });
});

describe("Home's og:video portrait cells", () => {
  const cells = portraitGrid();
  const left = OG_SIZE.width - PORTRAIT_BOX.right - PORTRAIT_BOX.width;

  it("tile the photo's box with whole-pixel cells, 24 across", () => {
    const area = cells.reduce((sum, c) => sum + c.width * c.height, 0);
    expect(area).toBe(PORTRAIT_BOX.width * PORTRAIT_BOX.height);
    expect(cells).toHaveLength(24 * 30);
    for (const cell of cells) {
      expect(Number.isInteger(cell.left + cell.top)).toBe(true);
      expect(cell.left).toBeGreaterThanOrEqual(left);
      expect(cell.left + cell.width).toBeLessThanOrEqual(
        left + PORTRAIT_BOX.width,
      );
      expect(cell.top + cell.height).toBeLessThanOrEqual(
        PORTRAIT_BOX.top + PORTRAIT_BOX.height,
      );
    }
  });

  it("print in the dither's 16 ranks, the drawing's cells by their own", () => {
    const ranks = new Set(cells.map((c) => c.rank));
    expect([...ranks].sort((a, b) => a - b)).toEqual(
      Array.from({ length: INTRO_RANKS }, (_, rank) => rank),
    );
    // The drawing's last row sits on the box's foot, ranked as on the site.
    const foot = cells.slice(-24).map((c) => c.rank);
    expect(foot).toEqual(
      Array.from({ length: 24 }, (_, x) => bayerRank(x, 23)),
    );
  });
});

describe("Home's og:video source", () => {
  it("was made from the card as it is now (pnpm og:video --check)", async () => {
    const source = await homeVideoSource();
    expect(source.width).toBe(OG_SIZE.width);
    expect(source.height).toBe(OG_SIZE.height);
    // The still is a PNG of the og:image's size.
    const png = Buffer.from(source.stillPng);
    expect(png.toString("latin1", 1, 4)).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([
      OG_SIZE.width,
      OG_SIZE.height,
    ]);
    // First and last frames are the still; the middle is not.
    const first = source.frame(0);
    expect(first).toEqual(source.frame(HOME_VIDEO_FRAMES - 1));
    expect(first).not.toEqual(source.frame(HOME_VIDEO_FRAMES / 2));
    expect(
      source.fingerprint,
      "The card, the pixel portrait, the timeline or the encoder changed: run pnpm og:video and commit the new video.",
    ).toBe(inputs);
  }, 60_000);
});
