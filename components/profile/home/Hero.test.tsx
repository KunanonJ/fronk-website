import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Hero, { holdsHeadline } from "@/components/profile/home/Hero";
import { homeHero } from "@/lib/content/home";
import { hero } from "@/lib/content/landing";
import { withRouter } from "@/tests/routerContext";

/*
 * The hero stage (design spec 8.1; plan gates 2 and 3): the recruiter facts,
 * one h1, and one motion toggle that holds the logo strip, the headline and
 * the cursor's tour. The phrases are mocked to two here, so the rotation can
 * be watched; the site ships one until the owner approves alternates (R5).
 */

// Vitest resolves a `?url` import to an empty string; the build's is hashed.
vi.mock("@/src/styles/profile/home-hero.css?url", () => ({
  default: "/assets/home-hero.css",
}));

const { ALTERNATE } = vi.hoisted(() => ({
  ALTERNATE: "Stay close to the work.",
}));

vi.mock("@/lib/content/home", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content/home")>();
  return {
    ...actual,
    homeHero: {
      ...actual.homeHero,
      phrases: [actual.homeHero.phrases[0], ALTERNATE],
    },
  };
});

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

/** Motion allowed; the canvas wide enough for its panels (and its tour). */
function stubWide() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("min-width"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

/**
 * Whether focus shows (`:focus-visible`): the browser decides from the
 * keyboard or pointer that moved it, a judgment jsdom makes its own way, so
 * the tests set it. The keyboard path itself runs in the browser tests.
 */
function stubFocusVisible(visible: boolean) {
  const matches = Element.prototype.matches;
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (
    this: Element,
    selector: string,
  ) {
    return selector === ":focus-visible"
      ? visible && this === document.activeElement
      : matches.call(this, selector);
  });
}

const shown = (container: HTMLElement) =>
  container.querySelector(".pf-hero__phrase")?.textContent;

const cursorAt = (container: HTMLElement) =>
  container.querySelector(".pf-mock__cursor")?.getAttribute("data-frame");

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("Hero", () => {
  it("links its own stylesheet, so no other page loads it", () => {
    render(withRouter(<Hero />));
    expect(
      document.head.querySelector(
        'link[rel="stylesheet"][data-precedence="pf-home-hero"]',
      ),
    ).toHaveAttribute("href", "/assets/home-hero.css");
  });

  it("is a region named by its one h1, with the first facts", () => {
    render(withRouter(<Hero />));
    const region = screen.getByRole("region", { name: homeHero.title });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(region).toHaveTextContent("Currently building");
    expect(region).toHaveTextContent("GoGoCash and Manut AI");
    expect(region).not.toHaveTextContent(/open to roles/i);
    expect(screen.getByRole("link", { name: "Contact me" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    // toHaveTextContent reads the no-break spaces as spaces.
    expect(region).toHaveTextContent(hero.homeLead);
  });

  it("has one motion toggle, and it holds the headline as well as the strip, with focus left on it", () => {
    // Focus that shows, on the toggle: the hardest case (a keyboard press);
    // a mouse click leaves focus there too, unshown.
    stubFocusVisible(true);
    const { container } = render(withRouter(<Hero />));
    expect(screen.getAllByRole("button", { name: /motion/ })).toHaveLength(1);

    const pause = screen.getByRole("button", { name: "Pause motion" });
    act(() => pause.focus());
    fireEvent.click(pause);
    expect(container.querySelector(".ds-marquee")).toHaveClass(
      "ds-marquee--paused",
    );
    advance(homeHero.rotateMs * 3);
    expect(shown(container)).toBe(homeHero.phrases[0]);

    // Play, with focus still on the toggle: the headline turns again.
    const play = screen.getByRole("button", { name: "Play motion" });
    expect(play).toHaveFocus();
    fireEvent.click(play);
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("holds the headline while keyboard focus is inside the hero", () => {
    stubFocusVisible(true);
    const { container } = render(withRouter(<Hero />));
    act(() => screen.getByRole("link", { name: "Contact me" }).focus());
    advance(homeHero.rotateMs * 3);
    expect(shown(container)).toBe(homeHero.phrases[0]);

    act(() => (document.activeElement as HTMLElement | null)?.blur());
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("holds nothing for focus a click leaves (not :focus-visible)", () => {
    stubFocusVisible(false);
    const { container } = render(withRouter(<Hero />));
    act(() => screen.getByRole("link", { name: "Contact me" }).focus());
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("ends the cursor's tour when the motion toggle pauses, as a pick does", () => {
    stubWide();
    const { container } = render(withRouter(<Hero />));
    // The tour's first stop is at 0.9 s.
    advance(1000);
    expect(cursorAt(container)).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));
    advance(5000);
    expect(cursorAt(container)).toBe("2");
    // Play again: the tour does not start over.
    fireEvent.click(screen.getByRole("button", { name: "Play motion" }));
    advance(5000);
    expect(cursorAt(container)).toBe("2");
  });
});

describe("Work's empty top over the strip, without scroll-driven animations", () => {
  const SCREEN = 768;
  /** Work's top on the screen, which the stubbed layout reports. */
  let workTop = SCREEN;

  function stubLayout(scrollDriven: boolean, { wideAndMoving = true } = {}) {
    vi.stubGlobal("CSS", {
      supports: (test: string) =>
        scrollDriven && test === "animation-timeline: view()",
    });
    // From 810 px with motion allowed (home-work-about.css's query).
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches:
            wideAndMoving &&
            query ===
              "(min-width: 50.625rem) and (prefers-reduced-motion: no-preference)",
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(
      SCREEN,
    );
    const rect = Element.prototype.getBoundingClientRect;
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
      function (this: Element) {
        return this.classList.contains("pf-work")
          ? ({ top: workTop } as DOMRect)
          : rect.call(this);
      },
    );
  }

  /** The hero, then Work, as Home puts them. */
  function renderHome() {
    const view = render(
      withRouter(
        <>
          <Hero />
          <article className="pf-work" />
        </>,
      ),
    );
    return { ...view, work: view.container.querySelector("article")! };
  }

  function scrollTo(up: number) {
    workTop = SCREEN - up;
    fireEvent.scroll(window);
  }

  const state = (work: HTMLElement) => [
    work.dataset.top,
    work.style.getPropertyValue("--pf-work-top"),
  ];

  afterEach(() => {
    workTop = SCREEN;
    vi.unstubAllGlobals();
  });

  it("draws none of it for Work's first 150 px up the screen, then all of it by 200 px, as kj-work-top does", () => {
    stubLayout(false);
    const { work, unmount } = renderHome();
    expect(state(work)).toEqual(["clear", "0"]);
    scrollTo(150);
    expect(state(work)).toEqual(["clear", "0"]);
    scrollTo(160);
    expect(state(work)).toEqual(["clear", "0.2"]);
    // From half drawn, it takes presses (a discrete property's flip).
    scrollTo(175);
    expect(state(work)).toEqual(["drawn", "0.5"]);
    scrollTo(200);
    expect(state(work)).toEqual(["drawn", "1"]);
    scrollTo(600);
    expect(state(work)).toEqual(["drawn", "1"]);
    unmount();
    expect(state(work)).toEqual([undefined, ""]);
  });

  it("follows Work when the stage's height moves it with no scroll, as a view timeline does", () => {
    const resized: (() => void)[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized.push(callback);
        }
        observe() {}
        disconnect() {}
      },
    );
    stubLayout(false);
    const { work } = renderHome();
    workTop = SCREEN - 190;
    expect(state(work)).toEqual(["clear", "0"]);
    for (const callback of resized) callback();
    expect(state(work)).toEqual(["drawn", "0.8"]);
  });

  it("leaves Work alone where the browser ties animations to scrolling", () => {
    stubLayout(true);
    const { work } = renderHome();
    scrollTo(100);
    expect(state(work)).toEqual([undefined, ""]);
  });

  it("leaves Work alone under 810 px or with reduced motion, where Work is drawn whole", () => {
    stubLayout(false, { wideAndMoving: false });
    const { work } = renderHome();
    scrollTo(100);
    expect(state(work)).toEqual([undefined, ""]);
  });
});

describe("holdsHeadline", () => {
  function controls() {
    render(
      <div>
        <a href="/contact">Contact me</a>
        <button type="button" className="ds-motion-toggle">
          Pause motion
        </button>
      </div>,
    );
    return {
      link: screen.getByRole("link"),
      toggle: screen.getByRole("button"),
    };
  }

  it("holds for focus that shows, never on the motion toggle", () => {
    stubFocusVisible(true);
    const { link, toggle } = controls();
    act(() => link.focus());
    expect(holdsHeadline(link)).toBe(true);
    act(() => toggle.focus());
    expect(holdsHeadline(toggle)).toBe(false);
  });

  it("holds nothing for focus that does not show", () => {
    stubFocusVisible(false);
    const { link } = controls();
    act(() => link.focus());
    expect(holdsHeadline(link)).toBe(false);
  });
});
