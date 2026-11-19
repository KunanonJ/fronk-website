import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProfileLink } from "@/components/profile/site/ProfileLink";

/*
 * A chrome link keeps the router's navigation and none of its active state: a
 * router that marks the page `aria-current="page"` must not decide the chrome's
 * marks (design spec 7.2).
 */

const ROUTER = vi.hoisted(() => ({
  routerClick: vi.fn(),
}));

vi.mock("@/lib/router/navigation", () => ({
  // What the router hands back for a link that is active on the page.
  useChromeLinkProps: (href: string) => ({
    href,
    "aria-current": "page",
    "data-status": "active",
    onClick: ROUTER.routerClick,
  }),
  usePathname: () => "/",
  notFound: () => {
    throw new Error("notFound");
  },
}));

describe("ProfileLink", () => {
  it("drops the router's aria-current and data-status, and sets the chrome's own", () => {
    render(
      <ProfileLink href="/#about" current="location">
        About
      </ProfileLink>,
    );
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/#about");
    expect(link).toHaveAttribute("aria-current", "location");
    expect(link).not.toHaveAttribute("data-status");
  });

  it("carries no aria-current when the chrome marks nothing", () => {
    render(<ProfileLink href="/#work">Work</ProfileLink>);
    expect(screen.getByRole("link", { name: "Work" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("runs the chrome's click handler, then the router's, on the same event", () => {
    ROUTER.routerClick.mockClear();
    const onClick = vi.fn((event: React.MouseEvent) => event.preventDefault());
    render(
      <ProfileLink href="/" onClick={onClick}>
        Home
      </ProfileLink>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Home" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(ROUTER.routerClick).toHaveBeenCalledTimes(1);
    // The router sees the default already prevented, so it does not navigate twice.
    expect(ROUTER.routerClick.mock.calls[0]![0].defaultPrevented).toBe(true);
  });
});
