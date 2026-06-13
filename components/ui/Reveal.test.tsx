import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Reduced-motion users (and the SSR/no-JS path) must never get hidden content.
vi.mock("@/lib/hooks/useReducedMotion", () => ({
  useReducedMotion: () => true,
}));

import { Reveal } from "./Reveal";

describe("Reveal > content is always present (a11y / no-JS / reduced-motion)", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <p>section body</p>
      </Reveal>,
    );
    expect(screen.getByText("section body")).toBeInTheDocument();
  });

  it("never starts hidden under reduced motion", () => {
    const { container } = render(
      <Reveal>
        <p>x</p>
      </Reveal>,
    );
    const el = container.querySelector(".reveal");
    expect(el).not.toBeNull();
    expect(el?.getAttribute("data-reveal")).not.toBe("hidden");
  });
});
