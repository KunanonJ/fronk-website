import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import RouteError from "@/components/RouteError";
import { routeTree } from "./routeTree.gen";

export type RouterContext = { queryClient: QueryClient };

export function getRouter() {
  // One QueryClient per request (getRouter runs per SSR request), never shared.
  // Every query is Sanity content, which changes only through the webhook
  // purge, so a visit never refetches it. The browser retries once; the
  // server not at all (the Sanity client already retries).
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY,
        retry: typeof window === "undefined" ? 0 : 1,
      },
    },
  });
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
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
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
