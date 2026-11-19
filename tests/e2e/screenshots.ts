import type { Page } from "@playwright/test";

/**
 * Waits until every dither canvas on the page holds its drawing for its
 * current size. DitherField draws at an idle moment after it mounts, and
 * again after each resize (design spec 8d); until then a canvas is blank, or
 * shows its last drawing stretched to the new box. Screenshots taken straight
 * after load caught either, so baselines had too, and CI's one retry hid a
 * mismatch. A canvas is settled when its bitmap is its box at the device
 * ratio DitherField uses (min(devicePixelRatio, 2)) and holds ink, and the
 * sizes held still between two polls. Canvases with no box (a closed
 * popover's) are skipped.
 */
export async function settleDither(page: Page) {
  await page.waitForFunction(
    () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const canvases = [
        ...document.querySelectorAll<HTMLCanvasElement>("canvas.ds-dither"),
      ].filter((canvas) => canvas.getBoundingClientRect().width > 0);
      const drawn = canvases.every((canvas) => {
        const box = canvas.getBoundingClientRect();
        if (
          canvas.width !== Math.round(box.width * ratio) ||
          canvas.height !== Math.round(box.height * ratio)
        )
          return false;
        const context = canvas.getContext("2d");
        if (!context) return false;
        const { data } = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        for (let alpha = 3; alpha < data.length; alpha += 4)
          if (data[alpha] !== 0) return true;
        return false;
      });
      const sizes = canvases
        .map((canvas) => `${canvas.width}x${canvas.height}`)
        .join(" ");
      const store = window as unknown as { __ditherSizes?: string };
      const still = store.__ditherSizes === sizes;
      store.__ditherSizes = sizes;
      return drawn && still;
    },
    undefined,
    { polling: 100 },
  );
}
