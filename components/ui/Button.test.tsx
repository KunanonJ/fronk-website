import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button > FogLAMP pill CTA", () => {
  it("renders primary as a filled pill without corner ticks", () => {
    const { container } = render(<Button>Ship</Button>);
    const btn = screen.getByRole("button", { name: "Ship" });
    expect(btn.className).toMatch(/rounded-full/);
    expect(btn.className).toMatch(/bg-accent/);
    expect(btn.className).not.toMatch(/font-mono/);
    expect(btn.className).not.toMatch(/uppercase/);
    expect(container.querySelector('[data-corner-ticks], .tick-armed')).toBeNull();
  });

  it("renders secondary as a dark pill", () => {
    render(
      <Button variant="secondary" href="/contact">
        Contact
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Contact" });
    expect(link.className).toMatch(/rounded-full/);
    expect(link.getAttribute("href")).toBe("/contact");
  });
});
