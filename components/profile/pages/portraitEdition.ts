/*
 * Save my edition (now-building-and-genz Phase 6), loaded by /about's
 * portrait (PortraitPlay) on the first hover, focus or press of its button:
 * the visitor's pixel portrait as they have it (the trait worn, the gold
 * edition once all six are found) painted on a 480 x 480 canvas, 20 px a
 * cell, with a small stamp in the corner ("KunanonJ · edition 3/6"), and
 * handed over as a PNG. A touch device that can share files gets the share
 * sheet (the Web Share API); everything else downloads the file. All of it
 * happens in the browser: nothing is sent anywhere.
 */

/** The PNG's side, in px. */
export const EDITION_SIZE = 480;

/** The PNG's file name. */
export const EDITION_FILE = "kunanonj-edition.png";

export interface Edition {
  /** The portrait as worn (wornPortrait), one character per cell. */
  readonly rows: readonly string[];
  /** Each character's colour (PORTRAIT_COLOURS); "." is the background. */
  readonly colours: Readonly<Record<string, string>>;
  /** The background's colour, as the page draws it. */
  readonly background: string;
  /** The stamp's words. */
  readonly stamp: string;
}

/** What became of it: downloaded, shared, or the share sheet closed. */
export type EditionResult = "saved" | "shared" | "cancelled";

/** The stamp: its type, its inset from the corner and its padding, in px. */
const STAMP = { font: 15, inset: 14, padX: 10, height: 30, radius: 8 };

/** Paints the edition: the background, a square per cell, then the stamp. */
export function drawEdition(
  ctx: CanvasRenderingContext2D,
  { rows, colours, background, stamp }: Edition,
): void {
  const cell = EDITION_SIZE / rows.length;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, EDITION_SIZE, EDITION_SIZE);
  rows.forEach((row, y) => {
    [...row].forEach((key, x) => {
      const fill = colours[key];
      if (!fill) return;
      ctx.fillStyle = fill;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    });
  });
  // The stamp: light words on the outline's ink, in the bottom right corner.
  ctx.font = `600 ${STAMP.font}px "JetBrains Mono", ui-monospace, Menlo, monospace`;
  const width = ctx.measureText(stamp).width + STAMP.padX * 2;
  const left = EDITION_SIZE - STAMP.inset - width;
  const top = EDITION_SIZE - STAMP.inset - STAMP.height;
  ctx.fillStyle = colours.k ?? "#120e1f";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(left, top, width, STAMP.height, STAMP.radius);
  } else {
    ctx.rect(left, top, width, STAMP.height);
  }
  ctx.fill();
  ctx.fillStyle = colours.w ?? "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(stamp, left + STAMP.padX, top + STAMP.height / 2);
}

/** The edition as a PNG. */
export function editionPng(edition: Edition): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = EDITION_SIZE;
  canvas.height = EDITION_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("No 2D canvas"));
  drawEdition(ctx, edition);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("No PNG"))),
      "image/png",
    );
  });
}

/** Downloads `blob` under the edition's file name. */
function download(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = EDITION_FILE;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  // The download has its own copy by the next task; free this one later.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Makes the PNG and shares it (`share`, for a touch device that can share
 * files) or downloads it. A share that fails for any reason but the visitor
 * closing the sheet downloads instead.
 */
export async function saveEdition(
  edition: Edition,
  share: boolean,
): Promise<EditionResult> {
  const blob = await editionPng(edition);
  if (share) {
    const file = new File([blob], EDITION_FILE, { type: "image/png" });
    try {
      await navigator.share({ files: [file], title: edition.stamp });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
    }
  }
  download(blob);
  return "saved";
}
