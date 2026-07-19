import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeaderNav } from "./HeaderNav";

const pathnameMock = vi.fn(() => "/about");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

describe("HeaderNav > marks the active route", () => {
  it("flags the link matching the pathname with aria-current=page", () => {
    pathnameMock.mockReturnValue("/about");
    render(
      <HeaderNav
        items={[
          { href: "/#ventures", label: "Work" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("leaves sibling routes unmarked", () => {
    pathnameMock.mockReturnValue("/about");
    render(
      <HeaderNav
        items={[
          { href: "/#ventures", label: "Work" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]}
      />,
    );
    expect(
      screen.getByRole("link", { name: "Work" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("link", { name: "Contact" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("activates hash nav items from the location hash on home", async () => {
    pathnameMock.mockReturnValue("/");
    window.history.replaceState(null, "", "/#ventures");
    render(
      <HeaderNav
        items={[
          { href: "/#ventures", label: "Work" },
          { href: "/about", label: "About" },
        ]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
        "aria-current",
        "page",
      );
    });
  });
});
