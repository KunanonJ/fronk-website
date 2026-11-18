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

describe("Headline", () => {
  it("renders the whole sentence on the server, still, with no alternate", () => {
    const html = renderToString(<Headline phrases={TWO} ready />);
    expect(html).toContain(CANONICAL);
    expect(html).not.toContain(ALTERNATE);
    expect(html).not.toContain("data-stamp");
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
    expect(single.container.querySelector(".pf-hero__sizer")).toBeNull();
    single.unmount();

    stubMotion(true);
    const reduced = render(<Headline phrases={TWO} ready />);
    advance(homeHero.rotateMs * 3);
    expect(shown(reduced.container)).toBe(CANONICAL);
    expect(reduced.container.querySelector(".pf-hero__sizer")).toBeNull();
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

  it("keeps the line's height on every swap: all phrases size one cell", () => {
    const { container } = render(<Headline phrases={TWO} ready />);
    const sizers = [...container.querySelectorAll(".pf-hero__sizer")];
    expect(sizers.map((sizer) => sizer.textContent)).toEqual([...TWO]);
  });
});
