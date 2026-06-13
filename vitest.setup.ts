import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
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
