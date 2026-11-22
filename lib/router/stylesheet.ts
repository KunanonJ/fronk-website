import { preinit } from "react-dom";

/** The longest a navigation waits for a stylesheet: past it, the request has stalled. */
const WAIT_CAP_MS = 4000;

/** Each sheet asked for, settled once it has loaded or failed. */
const settles = new Map<string, Promise<void>>();

function linkOf(href: string): HTMLLinkElement | undefined {
  return [
    ...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  ].find((link) => link.getAttribute("href") === href);
}

/** Settles once `link` has loaded or failed; at once if it already has. */
function settled(link: HTMLLinkElement | undefined, inserted: boolean) {
  // A sheet is set once the file has loaded and parsed.
  if (!link || link.sheet) return Promise.resolve();
  // One the page's HTML linked held the document's load, so a document
  // that has loaded with no sheet in it means the file failed.
  if (!inserted && document.readyState === "complete") {
    return Promise.resolve();
  }
  return new Promise<void>((done) => {
    const settle = () => done();
    link.addEventListener("load", settle, { once: true });
    link.addEventListener("error", settle, { once: true });
  });
}

/**
 * Inserts a page's own stylesheet the way its `<link rel="stylesheet"
 * precedence>` would (the same href and precedence, so React treats the two
 * as one resource), and resolves once the sheet has loaded or failed, or
 * after `capMs`. For a route's loader, on the client: the page then commits
 * whole, its styles in place.
 *
 * Without it, the first client navigation to such a page finishes in the
 * router while React still holds the new page back for its stylesheet, the
 * old page on screen. The router's hash scroll looks for its target then,
 * finds none, and the page opens without moving to it (UX hunt 2, U01:
 * /about to /#journey). Once the sheet is in, React holds nothing back.
 *
 * A sheet that failed is not waited for: React does not wait for one
 * either, and the page renders without it (components/ui/LazyFeature.tsx
 * asks for it again later). The cap is for a request that stalls; the page
 * then renders as React alone would render it. On the server this resolves
 * at once: the page's server-rendered HTML links the sheet itself.
 */
export function stylesheetReady(
  href: string,
  precedence: string,
  capMs = WAIT_CAP_MS,
): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  let ready = settles.get(href);
  if (!ready) {
    const linked = linkOf(href);
    preinit(href, { as: "style", precedence });
    ready = settled(linked ?? linkOf(href), !linked);
    settles.set(href, ready);
  }
  return new Promise<void>((done) => {
    const timer = window.setTimeout(done, capMs);
    void ready.then(() => {
      window.clearTimeout(timer);
      done();
    });
  });
}
