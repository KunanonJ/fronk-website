import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const invalidate = vi.hoisted(() => vi.fn(() => Promise.resolve()));
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ invalidate }),
}));
vi.mock("@/lib/utils/clipboard", () => ({
  writeClipboard: () => Promise.resolve(true),
}));

import NotFound from "@/components/NotFound";
import RouteError from "@/components/RouteError";

function hrefs(): string[] {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
}

describe("NotFound (bento 404)", () => {
  it("keeps the h1 text and draws the canvas hero", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Nothing lives here.",
    );
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "404 · Not found" }),
    ).toBeInTheDocument();
  });

  it("brings the site header and footer, on the canvas column", () => {
    const { container } = render(<NotFound />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    const chrome = container.querySelectorAll("[data-site-chrome]");
    expect(chrome[0]?.className).toMatch(/max-w-\[1000px\]/);
  });

  it("offers Home, Portfolio, Ventures and Contact, and no hidden pages", () => {
    render(<NotFound />);
    const nav = screen.getByRole("navigation", { name: "Recovery links" });
    const links = Array.from(nav.querySelectorAll("a"));
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/",
      "/portfolio",
      "/#ventures",
      "/contact",
    ]);
    expect(links.map((a) => a.textContent)).toEqual([
      "01Home→",
      "02Portfolio→",
      "03Ventures→",
      "04Contact→",
    ]);
    for (const href of hrefs()) {
      expect(href, href).not.toMatch(/^\/(blog|press)(\/|\?|#|$)/);
    }
  });

  it("reports a broken link by email, and copies the address", async () => {
    render(<NotFound />);
    const card = screen.getByRole("article", { name: "Broken link?" });
    const mail = card.querySelector("a");
    expect(mail?.getAttribute("href")).toMatch(
      /^mailto:fronk\.kunanon@gmail\.com\?subject=Broken%20link%20on%20/,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy email" }));
    });
    expect(
      screen.getByRole("button", { name: "Email copied" }),
    ).toBeInTheDocument();
  });
});

describe("RouteError", () => {
  it("reuses the 404 layout as an alert, and Try again re-runs the loaders", () => {
    const reset = vi.fn();
    render(<RouteError error={new Error("Sanity down")} reset={reset} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Something went wrong.",
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Recovery links" }),
    ).toBeInTheDocument();
    const retry = screen.getByRole("button", { name: "Try again" });
    expect(retry.className).toMatch(/bg-cta/);
    fireEvent.click(retry);
    expect(reset).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
  });
});
