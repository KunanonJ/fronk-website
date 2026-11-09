import {
  notFound as routerNotFound,
  useLocation,
} from "@tanstack/react-router";

/** The current path, for components that mark the active nav item. */
export function usePathname(): string {
  return useLocation({ select: (location) => location.pathname });
}

/** Throw a 404 from render code; the root route's notFoundComponent shows it. */
export function notFound(): never {
  throw routerNotFound();
}
