import { BUILD_ID } from "@/src/lib/buildId";

/*
 * A navigation whose code a deploy removed loads its page fresh, once.
 *
 * Each deploy replaces the hashed files under /assets and the old ones are
 * gone. A tab opened before it keeps the old build's code, so a link
 * followed inside the site can ask for a route's chunk (or one its loader
 * imports) that now answers 404. Vite's preload helper then sends a
 * cancelable `vite:preloadError` on window and throws. A route whose loader
 * imports its chunk (a skill's) shows the error page, and "Try again" fails
 * the same way; a route without a loader is reloaded by TanStack's lazy
 * route component, by a rule of its own (below).
 *
 * Whose chunk: the router's status is "pending" from the moment a load
 * starts (a link, Back or Forward, a redirect, Try again) until the new
 * page is committed, and "idle" otherwise; intent preloads leave it idle
 * (router-core load-client.ts). A failure while it is idle is a feature's
 * chunk on the page in use (the search dialog, the living status), and the
 * page is left alone, as src/lib/assetRetry.ts promises. A failure while it
 * is pending is the navigation's, and the page asked for is loaded as a
 * document.
 *
 * Where to: the router commits a navigation to history before it loads it
 * (commitLocation: history.push queues pushState for a microtask, then the
 * load starts), and a chunk's answer comes later, so the address is already
 * the destination. `location.reload()` loads it and keeps its history entry
 * (`assign` would add a second one; `replace` to an address with a hash
 * would only scroll).
 *
 * How: first the site's files linked since hydration that have not loaded
 * are asked for again past the caches (`cache: "reload"`), as the asset
 * retry does: WebKit keeps a failed module script and serves it to the
 * reloaded page. Vite links a chunk and its new imports (modulepreload or
 * stylesheet) before it imports the chunk, so the failed file is among
 * them even when its link's error comes after the import's, as it can in
 * every engine. The reload waits for the answers, or 3 s at most.
 *
 * At the top: the router hands scrolling back to the browser as the page
 * goes ("auto" on pagehide, router-core scroll-restoration.js). The
 * destination's history entry is already the current one, so the browser
 * stores the old page's offset in it and reopens the fresh page there,
 * often mid-page or at its footer (src/lib/scrollRestoration.ts leaves a
 * page that opens scrolled where it is). A pagehide listener added just
 * before the reload runs after the router's and sets "manual" again: the
 * fresh page opens at the top, or at its hash, as the link would have.
 *
 * Once per page and build: the session flag holds the id of the build that
 * reloaded (src/lib/buildId.ts) and the path it reloaded, set before the
 * reload. That page of that build failing again (files that keep failing)
 * shows the error page, never a second reload, so no page can reload
 * itself in a loop. Any other page may reload once, and so may a newer
 * build after a later deploy: a flag for the build alone let one failed
 * answer with no deploy (a 502) use up the reload, and a deploy later in
 * the same tab then ended on the error page. Without session storage it
 * never reloads.
 *
 * A navigation's failure is this file's alone: its event is canceled, so
 * the import resolves empty and the route fails with a plain error, not a
 * missing module that TanStack's lazy route component would reload as well
 * (once per error message, and without asking for the file again). The
 * same goes for every failure once the reload is on its way. Listening
 * starts after hydration (the root route): until then the page's own files
 * are the asset retry's.
 */

const FLAG = "pf-chunk-reload";

type Router = { readonly state: { readonly status: string } };

/** Listens for the site's chunks failing to load; returns the unsubscribe. */
export function reloadOnStaleChunk(router: Router, win: Window = window) {
  const assets = `${win.location.origin}/assets/`;
  const doc = win.document;
  const linked = () =>
    new Set(Array.from(doc.querySelectorAll("link"), (link) => link.href));
  // The page's links at hydration, and every link that has loaded since
  // (a load event never reaches window, so the document hears it).
  const loaded = linked();
  let reloading = false;

  const onLoad = ({ target }: Event) => {
    const href = (target as { href?: unknown } | null)?.href;
    if (typeof href === "string") loaded.add(href);
  };

  const onChunkError = (event: Event) => {
    if (!reloading && router.state.status !== "pending") return;
    event.preventDefault();
    if (reloading) return;
    const tried = `${BUILD_ID} ${win.location.pathname}`;
    try {
      if (win.sessionStorage.getItem(FLAG) === tried) return;
      win.sessionStorage.setItem(FLAG, tried);
    } catch {
      return;
    }
    reloading = true;
    let asked = false;
    const reload = () => {
      if (asked) return;
      asked = true;
      // After the router's own listener, which sets "auto": at the top.
      win.addEventListener("pagehide", () => {
        win.history.scrollRestoration = "manual";
      });
      win.location.reload();
    };
    const again = [...linked()]
      .filter((url) => url.startsWith(assets) && !loaded.has(url))
      .map((url) => win.fetch(url, { cache: "reload" }).catch(() => undefined));
    void Promise.all(again).then(reload);
    win.setTimeout(reload, 3000);
  };

  doc.addEventListener("load", onLoad, true);
  win.addEventListener("vite:preloadError", onChunkError);
  return () => {
    doc.removeEventListener("load", onLoad, true);
    win.removeEventListener("vite:preloadError", onChunkError);
  };
}
