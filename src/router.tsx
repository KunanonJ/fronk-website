import type { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import RouteError from "@/components/RouteError";
import { createQueryClient } from "@/src/lib/queryClient";
import { followHistory } from "@/lib/router/navigation";
import { restoreScrollAfterHydration } from "@/src/lib/scrollRestoration";
import { routeTree } from "./routeTree.gen";

export type RouterContext = { queryClient: QueryClient };

export function getRouter() {
  // One QueryClient per request (getRouter runs per SSR request), never
  // shared. Its settings are in src/lib/queryClient.ts.
  const queryClient = createQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    // On, except the restore that runs as the page hydrates once the visitor
    // has scrolled (src/lib/scrollRestoration.ts).
    scrollRestoration: restoreScrollAfterHydration(),
    // The scroll to the top of a new page is instant. It used to inherit
    // `html { scroll-behavior: smooth }` (globals.css, kept for in-page
    // anchors), so the new page appeared at the old position and glided up
    // while the 0.28 s cross-fade ran: both pages showed at once.
    scrollRestorationBehavior: "instant",
    defaultPreload: "intent",
    // Nested routes fail inside the site layout; the root has its own errorComponent.
    defaultErrorComponent: RouteError,
    // Page changes run as view transitions of type "page" (a short cross-fade
    // in globals.css); the theme toggle's circular reveal keys off its own
    // "theme" type, so it never plays on navigation. Hash-only changes
    // (/#ventures on Home) skip the transition. Reduced motion turns the
    // animation off in CSS.
    defaultViewTransition: {
      types: ({ pathChanged }) => (pathChanged ? ["page"] : false),
    },
  });
  setupRouterSsrQueryIntegration({ router, queryClient });
  // How the visitor reached each entry: a link, or Back, Forward and reload
  // (lib/router/navigation.ts). Before the router subscribes, so it is
  // current by the time the new page renders.
  if (typeof window !== "undefined") followHistory(router.history);
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
