import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecializationStatement } from "./SpecializationStatement";
import type { StatementSegment } from "@/lib/content/homePage";

const STATEMENT: readonly StatementSegment[] = [
  { text: "I turn " },
  { text: "messy operations", strong: true },
  { text: " into " },
  { text: "software", strong: true },
  { text: ", built in " },
  { text: "Southeast Asia", strong: true },
  { text: "." },
];

const PROPS = {
  eyebrow: "Operations / Software / Fintech / AI",
  statement: STATEMENT,
  primaryCta: { label: "See what I'm shipping", href: "/ventures" },
  secondaryCta: { label: "Read writing", href: "/writing" },
} as const;

describe("SpecializationStatement > given a segmented statement > renders it with weight-contrast emphasis", () => {
  it("renders the mono eyebrow", () => {
    render(<SpecializationStatement {...PROPS} />);
    expect(
      screen.getByText("Operations / Software / Fintech / AI"),
    ).toBeInTheDocument();
  });

  it("wraps only the emphasized segments in <strong>", () => {
    const { container } = render(<SpecializationStatement {...PROPS} />);
    const strongs = Array.from(container.querySelectorAll("strong")).map(
      (el) => el.textContent,
    );
    expect(strongs).toEqual([
      "messy operations",
      "software",
      "Southeast Asia",
    ]);
  });

  it("preserves the full statement text in order", () => {
    const { container } = render(<SpecializationStatement {...PROPS} />);
    expect(container.textContent).toContain(
      "I turn messy operations into software, built in Southeast Asia.",
    );
  });
});

describe("SpecializationStatement > given two CTAs > links each to its destination", () => {
  it("renders the primary and secondary CTAs as links", () => {
    render(<SpecializationStatement {...PROPS} />);
    expect(
      screen.getByRole("link", { name: /see what i'm shipping/i }),
    ).toHaveAttribute("href", "/ventures");
    expect(
      screen.getByRole("link", { name: /read writing/i }),
    ).toHaveAttribute("href", "/writing");
  });
});
