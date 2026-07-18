import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WritingCallout } from "./WritingCallout";

const PROPS = {
  eyebrow: "Journal",
  title: "Currently writing",
  description: "Long-form notes on building from zero.",
  cta: { label: "Read the journal", href: "/writing" },
} as const;

describe("WritingCallout > renders the writing invitation", () => {
  it("shows the title as a heading and the description", () => {
    render(<WritingCallout {...PROPS} />);
    expect(
      screen.getByRole("heading", { name: "Currently writing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Long-form notes on building from zero."),
    ).toBeInTheDocument();
  });

  it("links the CTA to the writing destination", () => {
    render(<WritingCallout {...PROPS} />);
    expect(
      screen.getByRole("link", { name: /read the journal/i }),
    ).toHaveAttribute("href", "/writing");
  });

  it("CTA uses opacity hover (minimal motion)", () => {
    render(<WritingCallout {...PROPS} />);
    const cta = screen.getByRole("link", { name: /read the journal/i });
    expect(cta.className).toContain("hover:opacity-60");
  });
});
