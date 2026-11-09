import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { INTRO_BURST_MS } from "@/components/landing/IntroBurst";
import IntroLoader from "@/components/landing/IntroLoader";
import {
  INTRO_GREETINGS,
  INTRO_MAX_MS,
  INTRO_SESSION_KEY,
  INTRO_TIMING,
  introExitStartMs,
} from "@/lib/content/introGreetings";

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

const overlay = () => screen.queryByTestId("intro-overlay");

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("IntroLoader", () => {
  beforeEach(() => {
    sessionStorage.clear();
    stubReducedMotion(false);
    vi.useFakeTimers({
      toFake: [
        "setTimeout",
        "clearTimeout",
        "requestAnimationFrame",
        "cancelAnimationFrame",
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("cycles the greetings and is gone within 1.5 s on a first visit", () => {
    render(<IntroLoader />);
    advance(20);
    expect(overlay()).not.toBeNull();
    expect(screen.getByText(INTRO_GREETINGS[0])).toBeInTheDocument();

    advance(INTRO_TIMING.wordMs);
    expect(screen.getByText(INTRO_GREETINGS[1])).toBeInTheDocument();

    advance(introExitStartMs() - INTRO_TIMING.wordMs);
    expect(screen.getByText(INTRO_GREETINGS.at(-1)!)).toBeInTheDocument();
    expect(overlay()).toHaveClass("is-exiting");

    advance(INTRO_MAX_MS - 20 - introExitStartMs());
    expect(overlay()).toBeNull();
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe("1");
  });

  it("does not show again in the same session", () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    render(<IntroLoader />);
    advance(50);
    expect(overlay()).toBeNull();
  });

  it("does not show under reduced motion", () => {
    stubReducedMotion(true);
    render(<IntroLoader />);
    advance(50);
    expect(overlay()).toBeNull();
  });

  it.each([
    ["a key press", () => fireEvent.keyDown(window, { key: "a" })],
    ["a pointer press", () => fireEvent.pointerDown(window)],
    ["a scroll wheel", () => fireEvent.wheel(window)],
    ["a touch", () => fireEvent.touchStart(window)],
  ])("ends at once on %s", (_label, trigger) => {
    render(<IntroLoader />);
    advance(20);
    expect(overlay()).not.toHaveClass("is-exiting");

    act(trigger);
    expect(overlay()).toHaveClass("is-exiting");
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe("1");

    advance(INTRO_TIMING.exitMs);
    expect(overlay()).toBeNull();
  });

  it("exposes a Skip intro button and hides the decorative words", () => {
    render(<IntroLoader />);
    advance(20);
    const skip = screen.getByRole("button", { name: "Skip intro" });
    expect(screen.getByText(INTRO_GREETINGS[0])).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.queryByRole("status")).toBeNull();

    fireEvent.click(skip);
    expect(overlay()).toHaveClass("is-exiting");
  });

  it("celebrates the last greeting with a decorative burst that fits the timing", () => {
    render(<IntroLoader />);
    advance(20);
    expect(screen.queryByTestId("intro-burst")).toBeNull();

    advance(introExitStartMs() - INTRO_TIMING.lastHoldMs);
    expect(screen.getByText(INTRO_GREETINGS.at(-1)!)).toBeInTheDocument();
    const burst = screen.getByTestId("intro-burst");
    expect(burst).toHaveAttribute("aria-hidden", "true");
    expect(burst.querySelectorAll(".intro-confetti").length).toBeGreaterThan(
      20,
    );
    expect(burst.querySelectorAll(".intro-sparkle").length).toBeGreaterThan(4);
    expect(INTRO_BURST_MS).toBeLessThanOrEqual(INTRO_TIMING.burstMs);
  });
});
