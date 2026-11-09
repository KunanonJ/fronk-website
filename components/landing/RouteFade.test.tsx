import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import RouteFade, {
  ROUTE_FADE_MS,
  shouldFadeRoute,
} from "@/components/landing/RouteFade";

let mockPath = "/";
vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => mockPath,
}));

function stubReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce") ? reduce : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}

describe("shouldFadeRoute", () => {
  it("skips first paint and same-path updates", () => {
    expect(shouldFadeRoute(null, "/")).toBe(false);
    expect(shouldFadeRoute("/blog", "/blog")).toBe(false);
  });

  it("fades between different landing routes", () => {
    expect(shouldFadeRoute("/", "/about")).toBe(true);
    expect(shouldFadeRoute("/blog", "/blog/cashback-loops")).toBe(true);
  });

  it("never fades into or out of Sanity Studio", () => {
    expect(shouldFadeRoute("/", "/studio")).toBe(false);
    expect(shouldFadeRoute("/studio/desk", "/")).toBe(false);
  });
});

describe("RouteFade", () => {
  let main: HTMLElement;
  let animate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPath = "/";
    stubReducedMotion(false);
    main = document.createElement("main");
    main.id = "main";
    animate = vi.fn(() => ({ cancel: vi.fn() }));
    (main as unknown as { animate: typeof animate }).animate = animate;
    document.body.appendChild(main);
  });

  afterEach(() => {
    main.remove();
    vi.unstubAllGlobals();
  });

  it("renders nothing and does not fade on first paint", () => {
    const { container } = render(<RouteFade />);
    expect(container).toBeEmptyDOMElement();
    expect(animate).not.toHaveBeenCalled();
  });

  it("fades <main> in over ~250 ms after a route change, never covering the page", () => {
    const { rerender } = render(<RouteFade />);
    mockPath = "/about";
    rerender(<RouteFade />);

    expect(ROUTE_FADE_MS).toBeLessThanOrEqual(300);
    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, options] = animate.mock.calls[0] as [
      Keyframe[],
      KeyframeAnimationOptions,
    ];
    expect(keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(options.duration).toBe(ROUTE_FADE_MS);
    expect(document.querySelector(".route-splash")).toBeNull();
  });

  it("does not fade under reduced motion", () => {
    stubReducedMotion(true);
    const { rerender } = render(<RouteFade />);
    mockPath = "/blog";
    rerender(<RouteFade />);
    expect(animate).not.toHaveBeenCalled();
  });
});
