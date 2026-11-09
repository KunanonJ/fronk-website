import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom implements neither `matchMedia` nor `IntersectionObserver`. Stub them so
// components that read `useReducedMotion` (matchMedia) or animate on scroll
// (IntersectionObserver) render in tests. Defaults: motion allowed, never
// intersecting — so scroll-triggered effects stay inert and components show
// their static, source-of-truth content (which is what we assert on).
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// With `globals: false`, @testing-library/react's automatic afterEach cleanup is
// not registered, so rendered DOM leaks between tests in a file. Wire it
// explicitly so each test starts from a clean document (FIRST: Independent).
afterEach(() => {
  cleanup();
});

// Components link with the project's TanStack Router <Link>, which needs a
// router in context. Unit tests render components on their own, so the jsdom
// project swaps it for a plain anchor with the same href, and gives the
// navigation hooks a neutral default (tests override them with vi.mock).
vi.mock("@/components/navigation/Link", async () => {
  const React = await import("react");
  type Props = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    prefetch?: unknown;
    scroll?: unknown;
    replace?: unknown;
  };
  const Link = React.forwardRef<HTMLAnchorElement, Props>(function Link({ href, prefetch: _p, scroll: _s, replace: _r, ...rest }, ref) {
    return React.createElement("a", { ref, href: typeof href === "string" ? href : (href.pathname ?? ""), ...rest });
  });
  return { default: Link };
});

vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => "/",
  notFound: () => {
    throw new Error("notFound");
  },
}));
