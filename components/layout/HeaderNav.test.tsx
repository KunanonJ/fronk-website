import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeaderNav } from "./HeaderNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ventures",
}));

const ITEMS = [
  { href: "/about", label: "About" },
  { href: "/ventures", label: "Ventures" },
  { href: "/writing", label: "Writing" },
] as const;

describe("HeaderNav > marks the active route", () => {
  it("flags the link matching the pathname with aria-current=page", () => {
    render(<HeaderNav items={ITEMS} />);
    expect(
      screen.getByRole("link", { name: "Ventures" }),
    ).toHaveAttribute("aria-current", "page");
  });

  it("matches nested routes under the active section", () => {
    // pathname "/ventures" also activates for "/ventures/<slug>" via startsWith;
    // here it equals, but a non-active sibling must stay unmarked.
    render(<HeaderNav items={ITEMS} />);
    expect(
      screen.getByRole("link", { name: "About" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("link", { name: "Writing" }),
    ).not.toHaveAttribute("aria-current");
  });
});
