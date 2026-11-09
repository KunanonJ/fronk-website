import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button > pill CTA (visual-redesign tokens)", () => {
  it("renders primary as a filled pill without corner ticks", () => {
    const { container } = render(<Button>Ship</Button>);
    const btn = screen.getByRole("button", { name: "Ship" });
    expect(btn.className).toMatch(/rounded-full/);
    expect(btn.className).toMatch(/bg-action/);
    expect(btn.className).toMatch(/text-on-action/);
    expect(btn.className).not.toMatch(/font-mono/);
    expect(btn.className).not.toMatch(/uppercase/);
    expect(
      container.querySelector("[data-corner-ticks], .tick-armed"),
    ).toBeNull();
  });

  it("renders secondary as a hairline surface pill", () => {
    render(
      <Button variant="secondary" href="/contact">
        Contact
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Contact" });
    expect(link.className).toMatch(/rounded-full/);
    expect(link.getAttribute("href")).toBe("/contact");
  });

  it("renders the inverse variant as an Ink pill", () => {
    render(<Button variant="inverse">Contact</Button>);
    const btn = screen.getByRole("button", { name: "Contact" });
    expect(btn.className).toMatch(/bg-ink/);
    expect(btn.className).toMatch(/text-page/);
  });

  it("keeps every size at least 36 px tall and uses the focus token", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const { unmount } = render(<Button size={size}>Go</Button>);
      const btn = screen.getByRole("button", { name: "Go" });
      expect(btn.className).toMatch(/\bh-(9|11|12)\b/);
      expect(btn.className).toMatch(/ring-focus/);
      unmount();
    }
  });
});
