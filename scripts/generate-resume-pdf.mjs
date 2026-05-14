/**
 * Renders /resume to public/resume.pdf using a headless Chromium.
 *
 * Requires the dev server (or a built+started server) to be running on
 * RESUME_URL (default: http://localhost:3000/resume). The print stylesheet
 * in app/globals.css hides nav/footer/buttons and forces a light scheme.
 *
 * Usage:
 *   pnpm dev            # in another shell
 *   pnpm pdf            # this script
 *
 * Env vars:
 *   RESUME_URL          full URL to the /resume page (default localhost:3000/resume)
 *   OUTPUT              output path (default public/resume.pdf)
 *   FORMAT              page format (default A4 — also accepts Letter)
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const url = process.env.RESUME_URL ?? "http://localhost:3000/resume";
const output = process.env.OUTPUT ?? "public/resume.pdf";
const format = /** @type {"A4" | "Letter"} */ (process.env.FORMAT ?? "A4");

async function main() {
  await mkdir(dirname(output), { recursive: true });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    // Force light scheme + print media for the headless render so the page
    // CSS picks up our @media print rules (light background, hidden chrome).
    await page.emulateMedia({ media: "print", colorScheme: "light" });

    const response = await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });

    if (!response || !response.ok()) {
      throw new Error(
        `Failed to load ${url} (status ${response?.status() ?? "no response"}). ` +
          `Is the dev server running?`,
      );
    }

    // Wait for company logos (DuckDuckGo CDN) to finish loading.
    await page.waitForLoadState("networkidle");

    await page.pdf({
      path: output,
      format,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: "18mm",
        right: "14mm",
        bottom: "18mm",
        left: "14mm",
      },
    });

    console.log(`Resume PDF written: ${output}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[pdf] failed:", err?.message ?? err);
  process.exit(1);
});
