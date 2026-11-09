import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/router/navigation", () => ({ usePathname: () => "/skills" }));
vi.mock("@/components/ThemeToggle", () => ({ ThemeToggle: () => null }));

import LandingTopNav from "@/components/landing/LandingTopNav";

/**
 * The nav's motion moved from framer-motion to CSS (visual-redesign Phase 6);
 * these pin the behaviour the animation library used to wrap.
 */
describe("LandingTopNav", () => {
  it("opens the mobile menu, then closes it on Escape", () => {
    render(<LandingTopNav navId="test-nav" />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("test-nav")).toBeNull();

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(document.getElementById("test-nav")).not.toBeNull();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.getElementById("test-nav")).toBeNull();
  });

  it("opens the Library menu and closes it on Escape", () => {
    render(<LandingTopNav navId="test-nav" />);
    const library = screen.getByRole("button", { name: "Library" });
    expect(library).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(library);
    expect(library).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Library" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("marks the current page", () => {
    render(<LandingTopNav navId="test-nav" />);
    const skills = screen
      .getAllByRole("link", { name: /Skills/ })
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(skills.length).toBeGreaterThan(0);
  });
});
