import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const award = vi.hoisted(() => vi.fn(() => true));
vi.mock("@/lib/brand/traitStore", () => ({ award }));

import { pillClass } from "@/components/ds/Pill";
import PatchArt from "@/components/landing/PatchArt";
import { NOT_FOUND_ART } from "@/components/landing/statusArt";
import { pixelBeats, pixelCells } from "@/components/profile/site/PixelArt";
import { CASE_PATHS } from "@/lib/content/casePaths";

/*
 * The 404 you fix (now-building-and-genz Phase 6): seven gaps, each a real
 * button; a press patches one, Patch it all the rest; once whole, the
 * print-in plays (not under reduced motion), a polite line says so and the
 * Coral cap is found.
 */
const play = vi.fn();

function setMotion(reduced: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduced && query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

const game = (
  <PatchArt
    rows={NOT_FOUND_ART}
    cells={pixelCells}
    beats={pixelBeats}
    play={play}
  />
);
const gaps = () => screen.queryAllByRole("button", { name: /^Patch pixel/ });
const rects = () => document.querySelectorAll("svg.pf-art rect").length;
const line = () => document.querySelector(".pf-patch__news")!;
const ALL = pixelCells(NOT_FOUND_ART).length;

beforeEach(() => {
  setMotion(false);
  // jsdom has no Web Animations; the print-in needs svg.animate.
  Object.defineProperty(SVGElement.prototype, "animate", {
    configurable: true,
    value: () => ({}),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  award.mockClear();
  play.mockClear();
  delete (SVGElement.prototype as { animate?: unknown }).animate;
});

describe("PatchArt", () => {
  it("arrives with seven named gaps over a drawing missing seven pixels", () => {
    render(game);
    expect(gaps().map((gap) => gap.getAttribute("aria-label"))).toEqual(
      Array.from({ length: 7 }, (_, i) => `Patch pixel ${i + 1} of 7`),
    );
    expect(rects()).toBe(ALL - 7);
    expect(line()).toHaveTextContent("Press a gap to patch it.");
    expect(line()).toHaveAttribute("aria-live", "polite");
    // Decorative drawing; the gaps are the controls.
    expect(document.querySelector("svg.pf-art")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("patches a gap by pointer: the pixel comes back with its pop", () => {
    render(game);
    act(() => fireEvent.click(gaps()[2]!));
    expect(gaps()).toHaveLength(6);
    expect(
      screen.queryByRole("button", { name: "Patch pixel 3 of 7" }),
    ).toBeNull();
    expect(rects()).toBe(ALL - 6);
    expect(document.querySelectorAll("rect.pf-patch__fill")).toHaveLength(1);
    expect(line()).toHaveTextContent("Patched 1 of 7.");
    expect(award).not.toHaveBeenCalled();
  });

  it("patches by keyboard: focus moves to the next gap, then to the lucky link", async () => {
    render(game);
    for (let left = 7; left > 0; left -= 1) {
      const gap = gaps()[0]!;
      gap.focus();
      // A focused button's Enter or Space is a click.
      act(() => fireEvent.click(gap));
      if (left > 1) expect(document.activeElement).toBe(gaps()[0]);
    }
    expect(gaps()).toHaveLength(0);
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "I'm feeling lucky" }),
    );
    expect(rects()).toBe(ALL);
    expect(line()).toHaveTextContent("Fixed. Every pixel is back.");
    await waitFor(() => expect(award).toHaveBeenCalledWith("cap", "notfound"));
  });

  it("Patch it all fills the rest, plays the print-in and finds the cap", async () => {
    render(game);
    act(() => fireEvent.click(gaps()[0]!));
    const all = screen.getByRole("button", { name: "Patch it all" });
    expect(all).toHaveClass(
      ...pillClass({ variant: "ghost", size: "sm" }).split(" "),
    );
    all.focus();
    act(() => fireEvent.click(all));
    expect(gaps()).toHaveLength(0);
    expect(rects()).toBe(ALL);
    expect(screen.queryByRole("button", { name: "Patch it all" })).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "I'm feeling lucky" }),
    );
    expect(play).toHaveBeenCalledOnce();
    const [svg, beats] = play.mock.calls[0]!;
    expect(svg).toBe(document.querySelector("svg.pf-art"));
    expect(beats).toEqual(pixelBeats(NOT_FOUND_ART));
    expect(line()).toHaveTextContent("Fixed. Every pixel is back.");
    await waitFor(() => expect(award).toHaveBeenCalledOnce());
    expect(award).toHaveBeenCalledWith("cap", "notfound");
  });

  it("under reduced motion, only fills: no print-in", async () => {
    setMotion(true);
    render(game);
    act(() =>
      fireEvent.click(screen.getByRole("button", { name: "Patch it all" })),
    );
    expect(rects()).toBe(ALL);
    expect(play).not.toHaveBeenCalled();
    await waitFor(() => expect(award).toHaveBeenCalledWith("cap", "notfound"));
  });

  it("links to /portfolio on the server and a case study once it runs", () => {
    const html = renderToString(game);
    expect(html).toContain('href="/portfolio"');
    expect(html).toContain('aria-label="Patch pixel 1 of 7"');
    render(game);
    const lucky = screen.getByRole("link", { name: "I'm feeling lucky" });
    expect(CASE_PATHS).toContain(lucky.getAttribute("href"));
    expect(lucky).toHaveClass("ds-pill", "ds-pill--ghost", "ds-pill--sm");
  });
});
