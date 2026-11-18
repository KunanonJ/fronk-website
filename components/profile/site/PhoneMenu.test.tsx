import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PhoneMenu,
  PhoneMenuButton,
} from "@/components/profile/site/PhoneMenu";

/*
 * The phone menu (design spec 7.6): a native popover named "Site" with six
 * links and the theme switch. Its "Menu" button names change with it, by script.
 */

const THEME = vi.hoisted(() => ({
  resolvedTheme: "light" as "light" | "dark",
  setTheme: vi.fn(),
}));
vi.mock("next-themes", () => ({ useTheme: () => THEME }));

function fireToggle(panel: HTMLElement, newState: "open" | "closed") {
  const event = new Event("toggle");
  Object.assign(event, { newState });
  act(() => {
    panel.dispatchEvent(event);
  });
}

/** jsdom hides closed popovers and will not focus inside them; an open one is shown. */
function showPopovers(): () => void {
  const style = document.createElement("style");
  style.textContent = "[popover] { display: block !important; }";
  document.head.append(style);
  return () => style.remove();
}

let unshow: () => void = () => {};

afterEach(() => {
  unshow();
  delete (HTMLElement.prototype as { showPopover?: unknown }).showPopover;
  vi.restoreAllMocks();
});

describe("PhoneMenu, server HTML", () => {
  it("is the site navigation, a popover with six links and the theme radios", () => {
    const html = renderToString(<PhoneMenu />);
    expect(html).toContain('id="site-menu"');
    expect(html).toContain('aria-label="Site"');
    expect(html).toContain('popover="auto"');
    expect(html.match(/class="pf-menu__link"/g)).toHaveLength(6);
    expect(html).toContain('href="/preview#work"');
    expect(html).toContain('href="/resume"');
    expect(html).toContain('href="/contact"');
    expect(html).toContain('type="radio"');
  });

  it("has a Menu button that controls the popover, and no script state", () => {
    const html = renderToString(<PhoneMenuButton />);
    expect(html).toMatch(/popovertarget="site-menu"/i);
    expect(html).toContain('aria-controls="site-menu"');
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain("aria-label");
    // Both labels are in the page; the stylesheet shows "Close" while it is open.
    expect(html).toContain("pf-nav__menu-open");
    expect(html).toContain("pf-nav__menu-close");
  });

  it("marks no section on its links, since the Primary nav carries the section mark", () => {
    const html = renderToString(<PhoneMenu />);
    expect(html).not.toContain("aria-current");
  });
});

describe("PhoneMenu, in the page", () => {
  it("turns its button into Close and moves focus to the first link", () => {
    (HTMLElement.prototype as { showPopover?: unknown }).showPopover = () => {};
    unshow = showPopovers();
    render(
      <>
        <PhoneMenuButton />
        <PhoneMenu />
      </>,
    );
    const menu = document.getElementById("site-menu")!;
    // The button's names are written by script at mount.
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    fireToggle(menu, "open");
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "Work", hidden: true }),
    );

    fireToggle(menu, "closed");
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(document.activeElement).toBe(button);
  });
});
