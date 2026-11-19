import type { Page } from "@playwright/test";

/**
 * Waits until every dither canvas on the page holds its drawing. DitherField
 * draws at an idle moment after it mounts (design spec 8d), so a screenshot
 * taken straight after load could catch a field blank or drawn, and the
 * baselines had taken either; CI's one retry then hid a mismatch. Canvases
 * with no box (a closed popover's) are skipped.
 */
export async function settleDither(page: Page) {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll<HTMLCanvasElement>("canvas.ds-dither")]
        .filter((canvas) => canvas.getBoundingClientRect().width > 0)
        .every((canvas) => {
          const context = canvas.getContext("2d");
          if (!context || canvas.width === 0 || canvas.height === 0)
            return false;
          const { data } = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          for (let alpha = 3; alpha < data.length; alpha += 4)
            if (data[alpha] !== 0) return true;
          return false;
        }),
    undefined,
    { polling: 100 },
  );
}
