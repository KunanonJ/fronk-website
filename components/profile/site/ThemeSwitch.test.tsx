import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitch } from "@/components/profile/site/ThemeSwitch";
import { ThemeToggle } from "@/components/profile/site/ThemeToggle";

/*
 * The theme controls (design spec 7.5): the phone switch is two native radios
 * in a fieldset with a legend; the nav toggle names the theme it switches to.
 */

const THEME = vi.hoisted(() => ({
  resolvedTheme: "light" as "light" | "dark",
  setTheme: vi.fn(),
}));
vi.mock("next-themes", () => ({ useTheme: () => THEME }));

beforeEach(() => {
  THEME.resolvedTheme = "light";
  THEME.setTheme.mockClear();
});

describe("ThemeSwitch", () => {
  it("is a fieldset named Theme with native Light and Dark radios", () => {
    const html = renderToString(<ThemeSwitch />);
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
    expect(html).toContain(">Theme</legend>");
    expect(html.match(/type="radio"/g)).toHaveLength(2);
    expect(html).toContain('value="light"');
    expect(html).toContain('value="dark"');
  });

  it("checks the current theme and switches on choice", () => {
    render(<ThemeSwitch />);
    const light = screen.getByRole("radio", { name: "Light" });
    const dark = screen.getByRole("radio", { name: "Dark" });
    expect(light).toBeChecked();
    expect(dark).not.toBeChecked();
    expect(screen.getByRole("group", { name: "Theme" })).toBeInTheDocument();

    fireEvent.click(dark);
    expect(THEME.setTheme).toHaveBeenCalledWith("dark");
  });

  it("shows dark when the page is dark", () => {
    THEME.resolvedTheme = "dark";
    render(<ThemeSwitch />);
    expect(screen.getByRole("radio", { name: "Dark" })).toBeChecked();
  });
});

describe("ThemeToggle", () => {
  it("is named for the theme it switches to, before and after hydration", () => {
    expect(renderToString(<ThemeToggle />)).toContain(
      'aria-label="Switch to night mode"',
    );
    THEME.resolvedTheme = "dark";
    render(<ThemeToggle />);
    const toggle = screen.getByRole("button", { name: "Switch to day mode" });
    fireEvent.click(toggle);
    expect(THEME.setTheme).toHaveBeenCalledWith("light");
  });
});
