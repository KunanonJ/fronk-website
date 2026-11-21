import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { CatchBoundary } from "@tanstack/react-router";

/*
 * A feature whose code loads on first use (the search dialog, the living
 * status, the trait toast, a link's preview card) and fails to load (a
 * deploy took its chunk away, a network blip) is left out, and the page in
 * use stays. React.lazy alone throws the failure to the route's error
 * boundary, and RouteError takes the whole page.
 *
 * lazyFeature marks a failure of the feature's import() as a failed load.
 * FeatureBoundary holds the feature: `fallback` while its code loads, and
 * in its place if it never does (React.lazy keeps the failure, so a later
 * mount stays without it and asks for nothing). Any other error, a real
 * one in a loaded feature, goes on to the route's error boundary as before,
 * so development and tests see it, and React logs what a boundary catches
 * either way (console.error).
 *
 * The boundary is the router's CatchBoundary, already in the entry chunk
 * (the entry carries every page, and the topic hubs sit at their budget):
 * an error its error component throws goes to the boundary above it.
 */

/** The errors that were a feature's code failing to load. */
const failedLoads = new WeakSet<object>();

/** The boundary never resets: a feature that failed stays out. */
const noReset = () => 0;

/** React.lazy for a feature whose failure to load the boundary can tell. */
export function lazyFeature<P extends object>(
  load: () => Promise<{ default: ComponentType<P> }>,
) {
  const Feature = lazy(() =>
    load().catch((error: object) => {
      failedLoads.add(error);
      throw error;
    }),
  );
  return Object.assign(Feature, {
    /** Starts loading ahead of use (hover, focus); a failure here is quiet. */
    preload: () => void load().catch(() => undefined),
  });
}

/** Holds a lazyFeature: nothing, or `fallback`, if its code fails to load. */
export function FeatureBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  /** While the code loads, and in its place if it never does. */
  fallback?: ReactNode;
}) {
  return (
    <CatchBoundary
      getResetKey={noReset}
      errorComponent={({ error }) => {
        // Not a failed load: a bug, for the route's error boundary to show.
        if (!failedLoads.has(error as object)) throw error;
        return fallback;
      }}
    >
      <Suspense fallback={fallback}>{children}</Suspense>
    </CatchBoundary>
  );
}
