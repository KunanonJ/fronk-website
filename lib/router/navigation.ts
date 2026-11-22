import { useCallback, useEffect, type ComponentPropsWithRef } from "react";
import {
  notFound as routerNotFound,
  type RouterHistory,
  useLinkProps,
  useLocation,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";

/** The current path, for components that mark the active nav item. */
export function usePathname(): string {
  return useLocation({ select: (location) => location.pathname });
}

/** The current location as one string (path, search and hash). It changes on every navigation. */
export function useLocationKey(): string {
  return useLocation({ select: (location) => location.href });
}

/**
 * True while a navigation is loading (the router's status is "pending"):
 * its loaders, a request-rendered page's data, a lazy route's code. The
 * site shell's progress line (components/profile/site/NavProgress.tsx).
 */
export function useNavigationPending(): boolean {
  return useRouterState({ select: (state) => state.status === "pending" });
}

/** Throw a 404 from render code; the root route's notFoundComponent shows it. */
export function notFound(): never {
  throw routerNotFound();
}

/**
 * The props of a link to `href` for the profile chrome: the router's link
 * behaviour without its active state. The router marks a link
 * `aria-current="page"` when it matches the page, and a link to a Home section
 * matches on its own hash, so the chrome sets `aria-current` itself
 * (components/profile/site/ProfileLink.tsx).
 */
export function useChromeLinkProps(href: string): ComponentPropsWithRef<"a"> {
  const [path, hash] = href.split("#");
  return useLinkProps({
    // Paths come from content, not the typed route tree.
    to: (path || "/") as never,
    hash: hash || undefined,
    activeProps: {},
  } as never);
}

/**
 * Calls back with the new location's hash (without "#") after each
 * navigation has rendered, once the router has done its own scrolling: the
 * router scrolls to a hash from its own "onRendered" listener, which it adds
 * before any component's. Same-page hash links and Back included. `callback`
 * should keep its identity (useCallback).
 */
export function useAfterNavigation(callback: (hash: string) => void): void {
  const router = useRouter({ warn: false });
  useEffect(() => {
    if (!router) return;
    return router.subscribe("onRendered", (event) =>
      callback(event.toLocation.hash),
    );
  }, [router, callback]);
}

/** The history's last action in this document; none before the first. */
let lastAction: string | undefined;

/**
 * Follows the router's history (src/router.tsx, on the client, before the
 * router's own listener), so that returnedTo() knows how the visitor came
 * to the current entry.
 */
export function followHistory(history: Pick<RouterHistory, "subscribe">) {
  history.subscribe(({ action }) => {
    lastAction = action.type;
  });
}

/**
 * True when Back, Forward or a reload brought the visitor to the current
 * entry: the router has put the page back where it was, and a script that
 * lands on the hash would move it. False when a link in the app or a fresh
 * load did.
 */
export function returnedTo(): boolean {
  if (lastAction) return lastAction !== "PUSH" && lastAction !== "REPLACE";
  const [load] = performance.getEntriesByType(
    "navigation",
  ) as PerformanceNavigationTiming[];
  return load?.type === "reload" || load?.type === "back_forward";
}

/** Navigates within the app and replaces the current history entry. */
export function useReplaceNavigate(): (to: string) => void {
  const navigate = useNavigate();
  return useCallback(
    (to: string) => {
      void navigate({ to: to as never, replace: true });
    },
    [navigate],
  );
}
