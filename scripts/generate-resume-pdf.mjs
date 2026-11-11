/**
 * Renders /resume to public/resume.pdf using a headless Chromium.
 *
 * Requires a built and started server on RESUME_URL (default:
 * http://localhost:3000/resume). Use the production build: the dev server
 * prints the placeholder site address. The print stylesheet in
 * src/styles/globals.css hides the header, footer and buttons and forces a
 * light scheme.
 *
 * Usage:
 *   pnpm build && pnpm start   # in another shell
 *   pnpm pdf                   # this script
 *
 * The script refuses to write a résumé that a recruiter could not use: one
 * longer than MAX_PAGES, one whose contact links are missing or point at
 * the placeholder host, or one drawn from the repo because Sanity could not
 * be read (the page marks that stand-in). After changing the print layout, also read the PDF's
 * text layer back (any PDF text extractor): words must come out whole and in
 * reading order.
 *
 * Env vars:
 *   RESUME_URL          full URL to the /resume page (default localhost:3000/resume)
 *   OUTPUT              output path (default public/resume.pdf)
 *   FORMAT              page format (default A4, also accepts Letter)
 *   MAX_PAGES           longest PDF to accept (default 2)
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const url = process.env.RESUME_URL ?? "http://localhost:3000/resume";
const output = process.env.OUTPUT ?? "public/resume.pdf";
const format = /** @type {"A4" | "Letter"} */ (process.env.FORMAT ?? "A4");
const maxPages = Number(process.env.MAX_PAGES ?? 2);
if (!Number.isInteger(maxPages) || maxPages < 1) {
  // NaN would make the page check below pass for any length.
  console.error(
    `[pdf] MAX_PAGES must be a whole number of pages, got "${process.env.MAX_PAGES}".`,
  );
  process.exit(1);
}

/** Page objects in a PDF written by Chromium (it does not compress them). */
function countPages(pdf) {
  return (pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? [])
    .length;
}

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

    // Company logos are lazy <img>s; load them all before printing.
    await page.evaluate(async () => {
      const images = Array.from(document.images);
      for (const img of images) img.loading = "eager";
      await Promise.all(
        images.map((img) =>
          img.complete
            ? null
            : new Promise((done) => {
                img.addEventListener("load", done, { once: true });
                img.addEventListener("error", done, { once: true });
              }),
        ),
      );
    });
    await page.waitForLoadState("networkidle");

    // When Sanity cannot be read, /resume draws the repo's résumé instead of
    // the error page. That stand-in is not what Studio may hold, so it is
    // never printed as the résumé.
    if ((await page.locator("[data-resume-stand-in]").count()) > 0)
      throw new Error(
        "The page shows the repo's résumé because Sanity could not be read. " +
          "Print again once Sanity answers.",
      );

    // A résumé without working contact links is not worth writing.
    const contacts = await page
      .locator("[data-resume-contact] a")
      .evaluateAll((links) => links.map((link) => link.href));
    if (!contacts.some((href) => href.startsWith("mailto:")))
      throw new Error("The printed résumé has no email link.");
    const placeholder = contacts.find((href) => href.includes("example.com"));
    if (placeholder)
      throw new Error(
        `The printed résumé links to ${placeholder}. Print from the ` +
          `production build (pnpm build && pnpm start), not the dev server.`,
      );

    const pdf = await page.pdf({
      format,
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: "12mm",
        right: "14mm",
        bottom: "12mm",
        left: "14mm",
      },
    });

    const pages = countPages(pdf);
    if (pages === 0 || pages > maxPages)
      throw new Error(
        `The résumé prints on ${pages} pages; the limit is ${maxPages}. ` +
          `Shorten the content or the layout in components/resume/ResumePrint.tsx.`,
      );

    await writeFile(output, pdf);
    console.log(`Resume PDF written: ${output} (${pages} pages)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("[pdf] failed:", err?.message ?? err);
  process.exit(1);
});
