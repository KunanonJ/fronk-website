import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ShowcaseGrid } from "@/components/profile/case/ShowcaseGrid";
import { flowState } from "@/components/profile/case/ShowcaseArt";
import { FLOW_TICK, nextFlowStep } from "@/components/profile/case/useFlowStep";
import { flipFrom } from "@/components/profile/case/lightboxMotion";
import { VIEWER_QUERY } from "@/components/profile/case/ShowcaseTile";
import { findProjectCase, type ShowcaseTile } from "@/lib/content/caseStudy";

/*
 * The showcase and its viewer (profile redesign Phase 5, design spec 9.9 and
 * 9.10; plan gate 5): the workflow moves until paused, the viewer opens from
 * Enlarge, is a labelled modal dialog, closes on Escape, its close button or
 * the empty stage, keeps the page still, and gives focus back.
 */

function tilesOf(slug: string): readonly ShowcaseTile[] {
  const chapter = findProjectCase(slug)!.chapters.find((c) =>
    c.blocks.some((b) => b.type === "showcase"),
  )!;
  const block = chapter.blocks.find((b) => b.type === "showcase")!;
  if (block.type !== "showcase") throw new Error("no showcase");
  return block.tiles;
}

/** matchMedia answering `queries` as true and every other query as false. */
function mediaMatching(...queries: string[]) {
  return (query: string) =>
    ({
      matches: queries.includes(query),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
  vi.useRealTimers();
});

describe("the showcase's tiles", () => {
  it("captions each drawn tile as an illustration, with its title", () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    const flow = screen.getByRole("figure", { name: "Approval flow" });
    expect(flow.querySelector("figcaption")?.textContent).toMatch(
      /^Illustration/,
    );
    expect(within(flow).getByRole("img")).toHaveAccessibleName(
      "Illustration of Approval flow: Submit a request, Approval chain, Recorded, Notified",
    );
    expect(
      screen.getByRole("figure", { name: "Architecture" }),
    ).toBeInTheDocument();
  });

  it("moves the workflow on every tick until paused, and holds while paused", () => {
    vi.useFakeTimers();
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    const flow = screen.getByRole("figure", { name: "Approval flow" });
    const now = () =>
      [...flow.querySelectorAll(".pf-flow__step")].findIndex(
        (step) => step.getAttribute("data-state") === "now",
      );
    // Still frame first: every step done.
    expect(now()).toBe(-1);
    act(() => vi.advanceTimersByTime(FLOW_TICK));
    expect(now()).toBe(0);
    act(() => vi.advanceTimersByTime(FLOW_TICK));
    expect(now()).toBe(1);
    const pause = within(flow).getByRole("button", {
      name: "Pause the animation",
    });
    expect(pause).not.toHaveAttribute("aria-pressed");
    fireEvent.click(pause);
    expect(
      within(flow).getByRole("button", { name: "Play the animation" }),
    ).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(FLOW_TICK * 3));
    expect(now()).toBe(1);
  });

  it("draws no pause control and keeps still under reduced motion", () => {
    window.matchMedia = mediaMatching("(prefers-reduced-motion: reduce)");
    vi.useFakeTimers();
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    expect(screen.queryByRole("button", { name: /animation/ })).toBeNull();
    act(() => vi.advanceTimersByTime(FLOW_TICK * 3));
    const states = [...document.querySelectorAll(".pf-flow__step")].map(
      (step) => step.getAttribute("data-state"),
    );
    expect(new Set(states)).toEqual(new Set(["done"]));
  });

  it("names each Enlarge button after its tile", () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    expect(
      screen.getByRole("button", { name: "Enlarge: Approval flow" }),
    ).toHaveAttribute("aria-haspopup", "dialog");
    expect(
      screen.getByRole("button", { name: "Enlarge: Architecture" }),
    ).toBeInTheDocument();
  });
});

describe("the viewer", () => {
  beforeEach(() => {
    window.matchMedia = mediaMatching(VIEWER_QUERY);
  });

  function openFrom(name: string) {
    const enlarge = screen.getByRole("button", { name: `Enlarge: ${name}` });
    enlarge.focus();
    fireEvent.click(enlarge);
    return enlarge;
  }

  it("opens as a dialog labelled by the tile's title, the page tile stepping aside", () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    openFrom("Approval flow");
    const dialog = screen.getByRole("dialog", { name: "Approval flow" });
    expect(dialog).toHaveAttribute("open");
    expect(document.querySelector('[data-sc-tile="flow"]')).toHaveAttribute(
      "data-viewing",
    );
    // Its own copy of the picture.
    expect(within(dialog).getByRole("img")).toHaveAccessibleName(
      /^Illustration of Approval flow/,
    );
  });

  it("puts focus on the pause control of a moving picture, else on close", async () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    openFrom("Approval flow");
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("button", { name: "Pause the animation" }),
    ).toHaveFocus();
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    await act(async () => {});
    openFrom("Architecture");
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }),
    ).toHaveFocus();
  });

  it("closes on Escape and gives focus back to Enlarge", async () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    const enlarge = openFrom("Architecture");
    const dialog = screen.getByRole("dialog");
    const cancel = new Event("cancel", { cancelable: true });
    await act(async () => {
      dialog.dispatchEvent(cancel);
    });
    // The page's own close runs, not the browser's: it plays the closing.
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog).not.toHaveAttribute("open");
    expect(
      document.querySelector('[data-sc-tile="layers"]'),
    ).not.toHaveAttribute("data-viewing");
    expect(enlarge).toHaveFocus();
  });

  it("closes on a press of the empty stage, not of the tile or its caption", async () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    openFrom("Architecture");
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelector(".pf-lightbox__tile")!);
    fireEvent.click(dialog.querySelector("figcaption")!);
    await act(async () => {});
    expect(dialog).toHaveAttribute("open");
    await act(async () => {
      fireEvent.click(dialog.querySelector(".pf-lightbox__stage")!);
    });
    expect(dialog).not.toHaveAttribute("open");
  });

  it("keeps the page still while open: wheel, touch and scroll keys do nothing", async () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    openFrom("Approval flow");
    const dialog = screen.getByRole("dialog");
    const wheel = new WheelEvent("wheel", { cancelable: true });
    window.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);
    for (const key of ["ArrowDown", "PageDown", "End", " "]) {
      const press = new KeyboardEvent("keydown", {
        key,
        cancelable: true,
        bubbles: true,
      });
      document.body.dispatchEvent(press);
      expect(press.defaultPrevented, key).toBe(true);
    }
    // Space still presses a focused button.
    const onButton = new KeyboardEvent("keydown", {
      key: " ",
      cancelable: true,
      bubbles: true,
    });
    within(dialog)
      .getByRole("button", { name: "Close" })
      .dispatchEvent(onButton);
    expect(onButton.defaultPrevented).toBe(false);
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    });
    const after = new WheelEvent("wheel", { cancelable: true });
    window.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
  });

  it("shares the pause state between the page's tile and the viewer", async () => {
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    openFrom("Approval flow");
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Pause the animation" }),
    );
    await act(async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));
    });
    expect(
      screen.getByRole("button", { name: "Play the animation" }),
    ).toBeInTheDocument();
  });

  it("opens from a press on the tile from 810 px, and not under it", () => {
    const { unmount } = render(
      <ShowcaseGrid tiles={tilesOf("tbh-intranet")} />,
    );
    fireEvent.click(document.querySelector('[data-sc-tile="layers"]')!);
    expect(screen.getByRole("dialog", { name: "Architecture" })).toBeVisible();
    unmount();
    window.matchMedia = mediaMatching();
    render(<ShowcaseGrid tiles={tilesOf("tbh-intranet")} />);
    fireEvent.click(document.querySelector('[data-sc-tile="layers"]')!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("the showcase's motion helpers", () => {
  it("checks steps off in order, then starts again", () => {
    expect([0, 1, 2, 3].map((i) => flowState(i, 2))).toEqual([
      "done",
      "done",
      "now",
      "next",
    ]);
    expect([0, 1, 2, 3].map((i) => flowState(i, 4))).toEqual([
      "done",
      "done",
      "done",
      "done",
    ]);
    expect(nextFlowStep(3, 4)).toBe(4);
    expect(nextFlowStep(4, 4)).toBe(0);
  });

  it("puts the viewer's tile over the page's tile for the FLIP", () => {
    expect(
      flipFrom(
        { left: 100, top: 200, width: 400, height: 250 },
        { left: 50, top: 60, width: 800, height: 500 },
      ),
    ).toBe("translate(50px, 140px) scale(0.5, 0.5)");
    expect(
      flipFrom(
        { left: 0, top: 0, width: 10, height: 10 },
        { left: 0, top: 0, width: 0, height: 0 },
      ),
    ).toBe("translate(0px, 0px) scale(1, 1)");
  });
});
