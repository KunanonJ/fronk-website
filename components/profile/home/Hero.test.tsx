import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Hero from "@/components/profile/home/Hero";
import { homeHero } from "@/lib/content/home";

/*
 * The hero stage (design spec 8.1; plan gates 2 and 3): the recruiter facts,
 * one h1, and one motion toggle that holds both the logo strip and the
 * headline. The phrases are mocked to two here, so the rotation can be
 * watched; the site ships one until the owner approves alternates (R5).
 */

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

const shown = (container: HTMLElement) =>
  container.querySelector(".pf-hero__phrase")?.textContent;

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Hero", () => {
  it("is a region named by its one h1, with the recruiter facts", () => {
    render(<Hero />);
    const region = screen.getByRole("region", { name: homeHero.title });
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(region).toHaveTextContent("Open to roles");
    expect(region).toHaveTextContent("Bangkok or remote");
    expect(screen.getByRole("link", { name: "Contact me" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    expect(region).toHaveTextContent(homeHero.lead);
  });

  it("has one motion toggle, and it holds the headline as well as the strip", () => {
    const { container } = render(<Hero />);
    expect(screen.getAllByRole("button", { name: /motion/ })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Pause motion" }));
    expect(container.querySelector(".ds-marquee")).toHaveClass(
      "ds-marquee--paused",
    );
    // The click left focus on the toggle; take it out of the hero.
    act(() => (document.activeElement as HTMLElement | null)?.blur());
    advance(homeHero.rotateMs * 3);
    expect(shown(container)).toBe(homeHero.phrases[0]);

    fireEvent.click(screen.getByRole("button", { name: "Play motion" }));
    act(() => (document.activeElement as HTMLElement | null)?.blur());
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });

  it("holds the headline while focus is inside the hero", () => {
    const { container } = render(<Hero />);
    act(() => screen.getByRole("link", { name: "Contact me" }).focus());
    advance(homeHero.rotateMs * 3);
    expect(shown(container)).toBe(homeHero.phrases[0]);

    act(() => (document.activeElement as HTMLElement | null)?.blur());
    advance(homeHero.rotateMs);
    expect(shown(container)).toBe(ALTERNATE);
  });
});
