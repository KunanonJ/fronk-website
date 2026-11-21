import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useEffect,
  useEffectEvent,
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
 * waits for: if only that one fails, the feature shows unstyled, and it is
 * not asked for again (as before). An import that resolves empty is one
 * too, a quiet one (nothing is thrown, so nothing is logged): the helper
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
 * Vite's is linked anew. React's `precedence` stylesheets are React's to
 * manage and are left alone.
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

/** Asks again, past the caches, for the files whose links failed. */
function refetchFailed() {
  const links = [...failedLinks];
  failedLinks.clear();
  return Promise.all(
    links.map(async (link) => {
      await fetch(link.href, { cache: "reload" }).catch(() => undefined);
      // Vite's stylesheet links only: React tracks its `precedence` ones.
      if (
        link.rel !== "stylesheet" ||
        link.hasAttribute("data-precedence") ||
        !link.isConnected
      )
        return;
      const fresh = link.cloneNode() as HTMLLinkElement;
      await new Promise((done) => {
        fresh.onload = fresh.onerror = done;
        link.replaceWith(fresh);
      });
    }),
  );
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
      (retry ? refetchFailed().then(load) : load()).then(
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

/** Holds a lazyFeature: nothing, or `fallback`, if its code fails to load. */
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
  return (
    <Failure.Provider value={{ fallback, onFail }}>
      <CatchBoundary getResetKey={noReset} errorComponent={FailedOrRethrow}>
        <Suspense fallback={fallback}>{children}</Suspense>
      </CatchBoundary>
    </Failure.Provider>
  );
}
