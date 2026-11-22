import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { CatchBoundary } from "@tanstack/react-router";

/*
 * A feature whose code loads on first use (the search dialog, the living
 * status, the trait toast, a link's preview card) and fails to load (a
 * deploy took its chunk away, a network blip) is left out, and the page in
 * use stays. React.lazy alone throws the failure to the route's error
 * boundary, and RouteError takes the whole page.
 *
 * A failed load is what the import rejects with when a chunk cannot be
 * fetched: a TypeError (a missing chunk's, in every engine), or the Error
 * "Unable to preload CSS for ..." of Vite's preload helper when a
 * stylesheet Vite links with the chunk does not load. Today's features link
 * their own stylesheet instead (React's `precedence`), which no import
 * waits for: if only that one fails, the feature shows unstyled (until its
 * next mount, below). An import that resolves empty is a failed load too,
 * a quiet one (nothing is thrown, so nothing is logged): the helper
 * resolves undefined when a `vite:preloadError` listener cancels the event,
 * as src/lib/staleChunk.ts does while a navigation loads. Anything else the
 * import rejects with, such as an error a module throws while it
 * initialises, is a bug and goes on to the route's error boundary as
 * before, so development and tests see it; only a module that throws a
 * TypeError as it initialises passes for a failed load. React logs what a
 * boundary catches either way (console.error).
 *
 * FeatureBoundary holds the feature: `fallback` while its code loads, and
 * in its place if it never does, which `onFail` hears. The mount that
 * failed stays as it is; the feature's next mount asks for its code again
 * (the next press of Search, the next link preview). Before it does, the
 * site's files whose links failed are asked for past the caches: Vite links
 * a chunk (and any stylesheet of its own) before it imports it, WebKit
 * keeps the failed answer and gives it to the next import without asking
 * the server, and the helper links each stylesheet once, so a failed one of
 * Vite's is linked anew. The mount waits for those answers 3 s at most, as
 * src/lib/assetRetry.ts does before its reload: a request that stalls goes
 * on without it.
 *
 * A feature's own stylesheet (React's `precedence` link) that failed, a
 * deploy or a blip, is asked for again the same way on the next mount of
 * any feature, and that mount waits for it to load or fail, 3 s at most,
 * as React holds a feature until its stylesheet has loaded: the feature
 * comes in styled once the file can be had, or plain after 3 s if the
 * request stalls, styled once it answers. The boundary's whole subtree
 * waits, not just the feature. React keeps the element it made for a
 * `precedence` stylesheet for the page's life and never links it again
 * (react-dom's getResource looks for a stylesheet by its href once, the
 * first time it is rendered; an unmount only counts it down). So that
 * element stays, and a fresh <link> with the same href goes right after
 * it, in its place in the cascade; React neither looks for it nor removes
 * it, and a fresh one that fails too is replaced by the next. Once per
 * mount, as for the code: a stylesheet that keeps failing is asked for once
 * each time a feature mounts, never on a re-render, never in a loop. Once
 * its fresh link has failed too (a tab left open across the deploy that
 * took the file away), mounts ask for it without waiting.
 *
 * A feature that stays mounted from page to page (the footer's living
 * status) has no next mount of its own, and the next feature to mount may
 * be pages away: whatever holds it calls retryFailedSheets on each
 * navigation and when the tab is shown again (SiteFooter), which asks for
 * the stylesheet the same way and holds nothing, so the feature takes its
 * styles once the fresh link loads (UX hunt 22-11-26, U27). Once per call,
 * as for a mount.
 *
 * The boundary is the router's CatchBoundary, already in the entry chunk
 * (the entry carries every page): an error its error component throws goes
 * to the boundary above it.
 */

/**
 * The errors that were a feature's code failing to load, each with what
 * lets that feature's next mount ask for the code again.
 */
const failedLoads = new WeakMap<object, () => void>();

/** The site's files whose <link> failed to load, since the last retry. */
const failedLinks = new Set<HTMLLinkElement>();
if (typeof document !== "undefined") {
  document.addEventListener(
    "error",
    ({ target }) => {
      if (
        target instanceof HTMLLinkElement &&
        target.href.startsWith(`${location.origin}/assets/`)
      ) {
        failedLinks.add(target);
      }
    },
    // A link's error does not bubble.
    true,
  );
}

/** A feature's own stylesheet: React's `precedence` link, or one made here. */
const isOwnSheet = (link: Element) => link.hasAttribute("data-precedence");

/** The stylesheet links made here, which React does not know. */
const relinked = new WeakSet<Element>();

/**
 * Asks again, past the caches, for the files whose links failed (with
 * `own`, the features' own stylesheets only), and links each stylesheet
 * anew; settles once the new links have loaded or failed.
 */
function refetchFailed(own?: boolean) {
  const links = [...failedLinks].filter((link) => !own || isOwnSheet(link));
  for (const link of links) failedLinks.delete(link);
  return Promise.all(
    links.map(async (link) => {
      await fetch(link.href, { cache: "reload" }).catch(() => undefined);
      if (link.rel !== "stylesheet" || !link.isConnected) return;
      const fresh = link.cloneNode() as HTMLLinkElement;
      relinked.add(fresh);
      await new Promise((done) => {
        fresh.onload = fresh.onerror = done;
        // React's own element stays (Vite's, or one made here, is replaced).
        if (isOwnSheet(link) && !relinked.has(link)) link.after(fresh);
        else link.replaceWith(fresh);
      });
    }),
  );
}

/**
 * Asks again for the features' own stylesheets whose links failed, as a
 * mount does, but holds nothing: for a feature that stays mounted (see the
 * header). Nothing is asked for when none failed.
 */
export function retryFailedSheets() {
  void refetchFailed(true);
}

/**
 * How long a mount waits for the files it asks for again: as long as the
 * reload of src/lib/assetRetry.ts waits for its file.
 */
const RETRY_WAIT_MS = 3000;

/** Settles once `retry` has, or after RETRY_WAIT_MS; the retry goes on. */
function awhile(retry: Promise<unknown>) {
  return new Promise<void>((done) => {
    const timer = setTimeout(done, RETRY_WAIT_MS);
    const settle = () => {
      clearTimeout(timer);
      done();
    };
    retry.then(settle, settle);
  });
}

const isFailedLoad = (error: unknown) =>
  error instanceof TypeError ||
  (error instanceof Error &&
    error.message.startsWith("Unable to preload CSS for "));

/** What the boundary shows if the code never loads, and whom it tells. */
const Failure = createContext<{ fallback?: ReactNode; onFail?: () => void }>(
  {},
);

/**
 * In a failed feature's place: the boundary's fallback. Once it is shown,
 * the feature's next mount may ask again (not sooner: React renders the
 * failing mount more than once, and each render would ask), and the
 * boundary's `onFail` hears of it.
 */
function Failed({ again }: { again: () => void }) {
  const { fallback, onFail } = useContext(Failure);
  // The caller's latest onFail, without a new onFail (an inline arrow, a
  // re-render) making the effect run again: once per failure.
  const fail = useEffectEvent(() => onFail?.());
  useEffect(() => {
    again();
    fail();
  }, [again]);
  return fallback;
}

/**
 * The boundary's error component, the same one on every render, so a
 * re-render of the page does not mount Failed anew.
 */
function FailedOrRethrow({ error }: { error: unknown }) {
  const again = failedLoads.get(error as object);
  // Not a failed load: a bug, for the route's error boundary to show.
  if (!again) throw error;
  return <Failed again={again} />;
}

/** The boundary never resets: a feature that failed stays out. */
const noReset = () => 0;

/** React.lazy for a feature whose failure to load the boundary can tell. */
export function lazyFeature<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  const attempt = (retry?: boolean) => {
    const feature = lazy(() =>
      (retry ? awhile(refetchFailed()).then(load) : load()).then(
        (module: { default: ComponentType<P> } | undefined) =>
          module ?? { default: () => <Failed again={again} /> },
        (error: unknown) => {
          if (isFailedLoad(error)) failedLoads.set(error as object, again);
          throw error;
        },
      ),
    );
    // Once per failure, however many places show it.
    const again = () => {
      if (current === feature) current = attempt(true);
    };
    return feature;
  };
  let current = attempt();

  /** The current attempt: a mount after a failed load asks again. */
  function Feature(props: P) {
    const Loaded = current;
    return <Loaded {...props} />;
  }

  return Object.assign(Feature, {
    /** Starts loading ahead of use (hover, focus); a failure here is quiet. */
    preload: () => void load().catch(() => undefined),
  });
}

const Nothing = () => null;

/**
 * Holds a lazyFeature: nothing, or `fallback`, if its code fails to load.
 * The rest of `children` waits with it (while its code loads, and while a
 * failed stylesheet is asked for again, 3 s at most) and goes with it if it
 * fails, so what should show at once belongs outside.
 */
export function FeatureBoundary({
  children,
  fallback,
  onFail,
}: {
  children: ReactNode;
  /** While the code loads, and in its place if it never does. */
  fallback?: ReactNode;
  /** Called once the code has failed to load, as the fallback stays. */
  onFail?: () => void;
}) {
  // Once per mount (the boundary stays while its children wait): the
  // features' stylesheets whose links failed, asked for again, and the
  // feature after them, 3 s at most; without the wait when each of them
  // was asked for again already and its fresh link failed too.
  const [Sheets] = useState(() => {
    const own = [...failedLinks].filter(isOwnSheet);
    if (own.length === 0) return Nothing;
    const retried = awhile(refetchFailed(true));
    return own.every((link) => relinked.has(link))
      ? Nothing
      : lazy(() => retried.then(() => ({ default: Nothing })));
  });
  return (
    <Failure.Provider value={{ fallback, onFail }}>
      <CatchBoundary getResetKey={noReset} errorComponent={FailedOrRethrow}>
        <Suspense fallback={fallback}>
          <Sheets />
          {children}
        </Suspense>
      </CatchBoundary>
    </Failure.Provider>
  );
}
