import type { ReactNode } from "react";
import {
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from "@tanstack/react-router";

/**
 * A router in context, for unit tests that render a component which reads
 * it: TanStack's ScriptOnce, in the Home hero, asks the router whether it
 * runs on the server. As in the app, it does where there is no document
 * (the node project) and does not under jsdom.
 */
export function withRouter(node: ReactNode) {
  const router = createRouter({ routeTree: createRootRoute() });
  return <RouterContextProvider router={router}>{node}</RouterContextProvider>;
}
