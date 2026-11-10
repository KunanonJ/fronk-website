import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const theme = vi.hoisted(() => ({
  resolvedTheme: "light" as string | undefined,
  setTheme: vi.fn(),
}));
vi.mock("next-themes", () => ({ useTheme: () => theme }));
vi.mock("@/lib/analytics/track", () => ({ track: vi.fn() }));

import { ThemeToggle } from "@/components/ThemeToggle";

function stubMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce") ? reduce : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
}

const root = document.documentElement;

beforeEach(() => {
  root.className = "light";
  theme.resolvedTheme = "light";
  theme.setTheme.mockReset();
  stubMotion(false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  // @ts-expect-error test cleanup of an optional DOM API
  delete document.startViewTransition;
  root.className = "";
  root.removeAttribute("style");
});

describe("ThemeToggle", () => {
  it("labels the next mode", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Switch to night mode" }),
    ).toBeInTheDocument();
  });

  it("switches at once without View Transitions", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(theme.setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches at once under reduced motion, even with View Transitions", () => {
    stubMotion(true);
    const start = vi.fn();
    document.startViewTransition = start as never;
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(start).not.toHaveBeenCalled();
    expect(theme.setTheme).toHaveBeenCalledWith("dark");
  });

  it("reveals the new theme from the click point, typed as a theme transition", async () => {
    vi.stubGlobal("CSS", { supports: () => true });
    let finish: () => void = () => {};
    const start = vi.fn((arg: { update: () => void; types: string[] }) => {
      arg.update();
      return { finished: new Promise<void>((r) => (finish = r)) };
    });
    document.startViewTransition = start as never;

    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"), { clientX: 120, clientY: 40 });

    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ types: ["theme"] }),
    );
    expect(root.style.getPropertyValue("--vtx")).toBe("120px");
    expect(root.style.getPropertyValue("--vty")).toBe("40px");
    expect(root.classList.contains("kj-vt")).toBe(true);
    expect(root.classList.contains("dark")).toBe(true);
    expect(theme.setTheme).toHaveBeenCalledWith("dark");

    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(root.classList.contains("kj-vt")).toBe(false);
  });
});
