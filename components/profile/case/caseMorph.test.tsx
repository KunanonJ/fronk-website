import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  morphFromCard,
  useMorphTarget,
} from "@/components/profile/case/caseMorph";

/*
 * The tile-to-case morph (plan morph-count-up_PLAN_20-11-26): only the
 * pressed card is marked, never two at once, and only the case it opens
 * marks its h1, once.
 */

function Cards() {
  const stop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    morphFromCard(event);
    event.preventDefault();
  };
  return (
    <>
      <article data-morph-card data-testid="one">
        <a href="/portfolio/one" onClick={stop}>
          One
        </a>
      </article>
      <article data-morph-card data-testid="two">
        <a href="/ventures/two" onClick={stop}>
          Two
        </a>
      </article>
      <a href="/about" onClick={stop}>
        Not a card
      </a>
    </>
  );
}

/** A plain press marks a card; the hero then reads which case opens. */
function pressAndOpen(link: string, href: string) {
  fireEvent.click(screen.getByText(link));
  return renderHook(() => useMorphTarget(href)).result.current;
}

afterEach(() => {
  // Leaves nothing pending for the next test.
  render(<Cards />);
  fireEvent.click(screen.getAllByText("Not a card").at(-1)!);
});

describe("morphFromCard", () => {
  it("marks only the pressed card, clearing any earlier mark", () => {
    render(<Cards />);
    fireEvent.click(screen.getByText("One"));
    expect(screen.getByTestId("one")).toHaveAttribute("data-morph");
    fireEvent.click(screen.getByText("Two"));
    expect(screen.getByTestId("one")).not.toHaveAttribute("data-morph");
    expect(screen.getByTestId("two")).toHaveAttribute("data-morph");
    expect(document.querySelectorAll("[data-morph]")).toHaveLength(1);
  });

  it("marks nothing for a press that opens a tab or a window", () => {
    render(<Cards />);
    for (const modifier of ["metaKey", "ctrlKey", "shiftKey", "altKey"]) {
      fireEvent.click(screen.getByText("One"), { [modifier]: true });
      expect(document.querySelectorAll("[data-morph]")).toHaveLength(0);
    }
    fireEvent.click(screen.getByText("One"), { button: 1 });
    expect(document.querySelectorAll("[data-morph]")).toHaveLength(0);
  });

  it("clears the marks when a link outside any card is pressed", () => {
    render(<Cards />);
    fireEvent.click(screen.getByText("One"));
    fireEvent.click(screen.getByText("Not a card"));
    expect(document.querySelectorAll("[data-morph]")).toHaveLength(0);
  });
});

describe("useMorphTarget", () => {
  it("is true for the case the pressed card opens, once", () => {
    render(<Cards />);
    expect(pressAndOpen("Two", "/ventures/two")).toBe(true);
    // The hero has rendered: the next page that opens is not a morph.
    expect(
      renderHook(() => useMorphTarget("/ventures/two")).result.current,
    ).toBe(false);
  });

  it("is false for any other case", () => {
    render(<Cards />);
    expect(pressAndOpen("One", "/ventures/two")).toBe(false);
  });

  it("is false with no card pressed, as on a first load", () => {
    expect(
      renderHook(() => useMorphTarget("/portfolio/one")).result.current,
    ).toBe(false);
  });
});
