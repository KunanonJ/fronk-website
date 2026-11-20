import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  drawEdition,
  EDITION_FILE,
  EDITION_SIZE,
  saveEdition,
  type Edition,
} from "@/components/profile/pages/portraitEdition";
import { PORTRAIT, PORTRAIT_COLOURS } from "@/lib/brand/pixelPortrait";
import { wornPortrait } from "@/lib/brand/portraitTraits";

/*
 * Save my edition (now-building-and-genz Phase 6): the portrait as worn on a
 * 480 x 480 canvas, 20 px a cell, with its stamp, saved as
 * kunanonj-edition.png, or shared where a touch device can share files.
 * jsdom draws nothing, so a recording context stands in for the canvas.
 */

type Call = [string, ...unknown[]];

/** A 2D context that records what is drawn, and in which colour. */
function recorder() {
  const calls: Call[] = [];
  const ctx = {
    fillStyle: "",
    font: "",
    textBaseline: "",
    fillRect: (...args: number[]) =>
      calls.push(["fillRect", ctx.fillStyle, ...args]),
    measureText: (text: string) => ({ width: text.length * 9 }),
    beginPath: () => calls.push(["beginPath"]),
    roundRect: (...args: number[]) => calls.push(["roundRect", ...args]),
    fill: () => calls.push(["fill", ctx.fillStyle]),
    fillText: (text: string, x: number, y: number) =>
      calls.push(["fillText", ctx.fillStyle, text, x, y]),
  };
  return { ctx, calls };
}

const EDITION: Edition = {
  rows: wornPortrait(PORTRAIT, "cap", 3),
  colours: PORTRAIT_COLOURS,
  background: "rgb(110, 60, 255)",
  stamp: "KunanonJ · edition 3/6",
};

describe("drawEdition", () => {
  it("paints the background, then every drawn cell as a 20 px square", () => {
    const { ctx, calls } = recorder();
    drawEdition(ctx as unknown as CanvasRenderingContext2D, EDITION);
    const rects = calls.filter(([name]) => name === "fillRect");
    expect(rects[0]).toEqual(["fillRect", "rgb(110, 60, 255)", 0, 0, 480, 480]);
    const drawn = EDITION.rows.join("").replaceAll(".", "").length;
    expect(rects).toHaveLength(1 + drawn);
    // The cap's coral, on its first cell (row 2, column 7): 20 px a cell.
    expect(rects).toContainEqual([
      "fillRect",
      PORTRAIT_COLOURS.c,
      140,
      40,
      20,
      20,
    ]);
    for (const [, , , , w, h] of rects.slice(1)) {
      expect([w, h]).toEqual([20, 20]);
    }
  });

  it("stamps the edition in the bottom right corner, light on ink", () => {
    const { ctx, calls } = recorder();
    drawEdition(ctx as unknown as CanvasRenderingContext2D, EDITION);
    const text = calls.find(([name]) => name === "fillText")!;
    expect(text.slice(0, 3)).toEqual([
      "fillText",
      PORTRAIT_COLOURS.w,
      "KunanonJ · edition 3/6",
    ]);
    const [, left, top, width, height] = calls.find(
      ([name]) => name === "roundRect",
    ) as [string, number, number, number, number];
    expect(left + width).toBe(EDITION_SIZE - 14);
    expect(top + height).toBe(EDITION_SIZE - 14);
    expect(calls).toContainEqual(["fill", PORTRAIT_COLOURS.k]);
  });
});

describe("saveEdition", () => {
  let canvases: HTMLCanvasElement[];
  let clicked: HTMLAnchorElement[];

  beforeEach(() => {
    canvases = [];
    clicked = [];
    const { ctx } = recorder();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      function (this: HTMLCanvasElement) {
        canvases.push(this);
        return ctx as unknown as CanvasRenderingContext2D;
      } as never,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
      (callback: BlobCallback) =>
        callback(new Blob(["png"], { type: "image/png" })),
    );
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this);
    });
    Object.assign(URL, {
      createObjectURL: vi.fn(() => "blob:edition"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (navigator as { share?: unknown }).share;
  });

  it("downloads a 480 x 480 PNG named kunanonj-edition.png", async () => {
    await expect(saveEdition(EDITION, false)).resolves.toBe("saved");
    expect(canvases).toHaveLength(1);
    expect([canvases[0]!.width, canvases[0]!.height]).toEqual([480, 480]);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalledWith(
      expect.any(Function),
      "image/png",
    );
    expect(clicked).toHaveLength(1);
    expect(clicked[0]!.download).toBe(EDITION_FILE);
    expect(EDITION_FILE).toBe("kunanonj-edition.png");
    expect(clicked[0]!.getAttribute("href")).toBe("blob:edition");
    // The link is gone again.
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("shares the PNG as a file where it can, and downloads nothing", async () => {
    const share = vi.fn((_data: ShareData) => Promise.resolve());
    Object.assign(navigator, { share });
    await expect(saveEdition(EDITION, true)).resolves.toBe("shared");
    const file = share.mock.calls[0]![0].files![0]!;
    expect(file.name).toBe(EDITION_FILE);
    expect(file.type).toBe("image/png");
    expect(clicked).toHaveLength(0);
  });

  it("does nothing more when the share sheet is closed, and downloads when sharing fails", async () => {
    const share = vi.fn(() =>
      Promise.reject(new DOMException("closed", "AbortError")),
    );
    Object.assign(navigator, { share });
    await expect(saveEdition(EDITION, true)).resolves.toBe("cancelled");
    expect(clicked).toHaveLength(0);
    share.mockImplementation(() =>
      Promise.reject(new DOMException("no", "NotAllowedError")),
    );
    await expect(saveEdition(EDITION, true)).resolves.toBe("saved");
    expect(clicked[0]!.download).toBe(EDITION_FILE);
  });
});
