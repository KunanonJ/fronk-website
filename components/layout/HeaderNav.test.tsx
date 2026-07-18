import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeaderNav } from "./HeaderNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ventures",
}));

const ITEMS = [
  { href: "/ventures", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

describe("HeaderNav > marks the active route", () => {
  it("flags the link matching the pathname with aria-current=page", () => {
    render(<HeaderNav items={ITEMS} />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("leaves sibling routes unmarked", () => {
    render(<HeaderNav items={ITEMS} />);
    expect(
      screen.getByRole("link", { name: "About" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("link", { name: "Contact" }),
    ).not.toHaveAttribute("aria-current");
  });
});
