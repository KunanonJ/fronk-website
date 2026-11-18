import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Headline, stampWords } from "@/components/profile/home/Headline";
import { homeHero } from "@/lib/content/home";

/*
 * The hero h1's rotation (design spec 8.1, 5.5; plan gate 3): one swap every
 * 4.2 s once the hero can be seen; held while hovered, while the hero holds
 * it (its motion toggle, focus inside it), under reduced motion and with a
 * single phrase. Its name is the canonical sentence, whatever line shows.
 */

const CANONICAL = homeHero.phrases[0]!;
const ALTERNATE = "Ship the smallest thing that proves the bet.";
const TWO = [CANONICAL, ALTERNATE] as const;

function stubMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

const heading = () => screen.getByRole("heading", { level: 1 });
const shown = (container: HTMLElement) =>
  container.querySelector(".pf-hero__phrase")?.textContent;

beforeEach(() => {
  vi.useFakeTimers();
  stubMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** The server's HTML (our own render, never page input) as a document body. */
function parse(html: string): HTMLElement {
  return new DOMParser().parseFromString(html, "text/html").body;
}

/** The text an element holds, as copying it or a crawler reads it. */
function textOf(html: string): string {
  return parse(html).textContent ?? "";
}

describe("Headline", () => {
  it("renders the whole sentence on the server, still; the alternate only sizes the line, as an attribute", () => {
    const html = renderToString(<Headline phrases={TWO} ready />);
    expect(textOf(html)).toBe(`${homeHero.greetingLine} ${CANONICAL}`);
    expect(html).not.toContain("data-stamp");
    expect(html).toContain(`data-text="${ALTERNATE}"`);
  });

  it("swaps every 4.2 s once the hero can be seen", () => {
    const { container } = render(<Headline phrases={TWO} ready />);
    expect(shown(container)).toBe(CANONICAL);

    advance(homeHero.rotateMs - 1);
    expect(shown(container)).toBe(CANONICAL);
    advance(1);
    expect(shown(container)).toBe(ALTERNATE);
    expect(container.querySelector(".pf-hero__out")).toHaveTextContent(
      CANONICAL,
    );

    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(CANONICAL);
  });

  it("removes the leaving line once its blur ends, so the h1 holds only what shows", () => {
    const { container } = render(<Headline phrases={TWO} ready />);
    advance(homeHero.rotateMs);
    const out = container.querySelector(".pf-hero__out")!;
    expect(out).toHaveTextContent(CANONICAL);
    // The blur's end. jsdom has no AnimationEvent, so React listens for the
    // WebKit name there; browsers send "animationend".
    fireEvent.animationEnd(out);
    fireEvent(out, new Event("webkitAnimationEnd", { bubbles: true }));
    expect(container.querySelector(".pf-hero__out")).toBeNull();
    expect(heading().textContent).toBe(`${homeHero.greetingLine} ${ALTERNATE}`);
  });

  it("keeps the canonical name whatever line shows", () => {
    render(<Headline phrases={TWO} ready />);
    expect(heading()).toHaveAccessibleName(homeHero.title);
    advance(homeHero.rotateMs);
    expect(heading()).toHaveAccessibleName(
      "Hi, I’m Kunanon Jarat. Forward deployed AI engineering from Bangkok.",
    );
  });

  it("holds still while the pointer is on the line, and starts a full stay after", () => {
    const { container } = render(<Headline phrases={TWO} ready />);
    const line = container.querySelector(".pf-hero__rotor")!;
    fireEvent.pointerEnter(line);
    advance(homeHero.rotateMs * 3);
    expect(shown(container)).toBe(CANONICAL);

    fireEvent.pointerLeave(line);
    advance(homeHero.rotateMs - 1);
    expect(shown(container)).toBe(CANONICAL);
    advance(1);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("holds still while the hero holds it: its toggle, or focus inside it", () => {
    const { container, rerender } = render(
      <Headline phrases={TWO} ready paused />,
    );
    advance(homeHero.rotateMs * 3);
    expect(shown(container)).toBe(CANONICAL);

    rerender(<Headline phrases={TWO} ready paused={false} />);
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("waits while the intro covers the hero", () => {
    const { container, rerender } = render(
      <Headline phrases={TWO} ready={false} />,
    );
    advance(homeHero.rotateMs * 2);
    expect(shown(container)).toBe(CANONICAL);

    rerender(<Headline phrases={TWO} ready />);
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("never rotates with one phrase or under reduced motion", () => {
    const single = render(<Headline phrases={[CANONICAL]} ready />);
    advance(homeHero.rotateMs * 3);
    expect(shown(single.container)).toBe(CANONICAL);
    // One phrase sizes its own line.
    expect(single.container.querySelector(".pf-hero__sizer")).toBeNull();
    single.unmount();

    stubMotion(true);
    const reduced = render(<Headline phrases={TWO} ready />);
    advance(homeHero.rotateMs * 3);
    expect(shown(reduced.container)).toBe(CANONICAL);
    expect(reduced.container.querySelector(".pf-hero__out")).toBeNull();
  });

  it("stamps the new words on from line 1's count, alternating sides", () => {
    const { container } = render(<Headline phrases={TWO} ready />);
    advance(homeHero.rotateMs);
    const words = [...container.querySelectorAll<HTMLElement>(".pf-word")];
    expect(words.map((word) => word.textContent)).toEqual(ALTERNATE.split(" "));
    expect(words[0]!.style.getPropertyValue("--i")).toBe("4");
    expect(words.map((word) => word.dataset.side).slice(0, 3)).toEqual([
      "left",
      "right",
      "left",
    ]);
    expect(stampWords("Hi, I’m Kunanon Jarat.", 0)).toHaveLength(4);
  });

  it("keeps the line's height on every swap: all phrases size one cell, from the server on, whatever the motion setting", () => {
    // Empty, hidden spans that CSS draws from data-text: on the server (where
    // reduced motion is assumed), and on the client either way, so the
    // line's height never changes at hydration.
    const sizersOf = (root: ParentNode) =>
      [...root.querySelectorAll(".pf-hero__sizer")].map((sizer) => ({
        text: sizer.textContent,
        hidden: sizer.getAttribute("aria-hidden"),
        phrase: sizer.getAttribute("data-text"),
      }));
    const expected = TWO.map((phrase) => ({
      text: "",
      hidden: "true",
      phrase,
    }));
    const server = parse(renderToString(<Headline phrases={TWO} ready />));
    expect(sizersOf(server)).toEqual(expected);

    const moving = render(<Headline phrases={TWO} ready />);
    expect(sizersOf(moving.container)).toEqual(expected);
    moving.unmount();

    stubMotion(true);
    const still = render(<Headline phrases={TWO} ready />);
    expect(sizersOf(still.container)).toEqual(expected);
  });
});
