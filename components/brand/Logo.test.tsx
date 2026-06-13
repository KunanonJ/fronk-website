import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo > the fronk terminal-cursor logotype", () => {
  it("renders the lowercase 'fronk' wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("fronk")).toBeInTheDocument();
  });

  it("renders a decorative mint cursor that blinks by default", () => {
    const { container } = render(<Logo />);
    const cursor = container.querySelector("[data-cursor]");
    expect(cursor).not.toBeNull();
    expect(cursor).toHaveAttribute("aria-hidden");
    expect(cursor?.className).toContain("bg-accent");
    expect(cursor?.className).toContain("animate-cursor-blink");
  });

  it("can render a solid, non-blinking cursor on request", () => {
    const { container } = render(<Logo blink={false} />);
    const cursor = container.querySelector("[data-cursor]");
    expect(cursor).not.toBeNull();
    expect(cursor?.className).not.toContain("animate-cursor-blink");
  });
});
