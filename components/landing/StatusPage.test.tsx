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
import { ERROR_ART, NOT_FOUND_ART } from "@/components/landing/statusArt";

function hrefs(): string[] {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
}

describe("NotFound (profile redesign, Phase 7f)", () => {
  it("keeps the h1 text in the new hero, and draws its own pixel picture", () => {
    const { container } = render(<NotFound />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Nothing lives here.");
    expect(h1).toHaveClass("t-display");
    expect(h1.closest("section")).toHaveClass("pf-page-hero");
    expect(screen.getByText("Page not found")).toBeInTheDocument();
    const status = screen.getByRole("article", { name: "404 · Not found" });
    // Decorative: hidden from screen readers, drawn one square per cell.
    const art = status.querySelector("svg.pf-art");
    expect(art).toHaveAttribute("aria-hidden", "true");
    expect(art?.querySelectorAll("rect").length).toBeGreaterThan(100);
    // The page is the skip link's target, under the fixed bar.
    expect(container.querySelector("main#main.pf-main")).not.toBeNull();
  });

  it("brings the site's pill nav and footer, which carry the redesign's scope", () => {
    // Since the Phase 6 cutover the 404 wears the new chrome around its old
    // body (plan step 6c; Phase 7f restyles the body).
    const { container } = render(<NotFound />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    const chrome = [...container.querySelectorAll("[data-site-chrome]")];
    expect(chrome.map((el) => el.tagName)).toEqual(["HEADER", "FOOTER"]);
    for (const el of chrome)
      expect(el).toHaveAttribute("data-design", "profile");
    expect(container.querySelector("header.pf-nav")).not.toBeNull();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveAttribute("href", "#main");
    // Fixed and moved off screen, it would print: print drops it (pnpm pdf).
    expect(skip).toHaveAttribute("data-print-hide");
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
    // The dark pill: the one action the error state exists for.
    expect(retry).toHaveClass("ds-pill");
    expect(retry).not.toHaveClass("ds-pill--ghost");
    fireEvent.click(retry);
    expect(reset).toHaveBeenCalledOnce();
    expect(invalidate).toHaveBeenCalledOnce();
  });
});

describe("the status pages' pixel drawings", () => {
  it("keep every row of a drawing the same length", () => {
    for (const art of [NOT_FOUND_ART, ERROR_ART]) {
      const widths = new Set(art.map((row) => row.length));
      expect(widths.size).toBe(1);
    }
  });

  it("draw the 404 and the error differently", () => {
    expect(NOT_FOUND_ART.join("\n")).not.toBe(ERROR_ART.join("\n"));
    render(<RouteError error={new Error("x")} reset={() => {}} />);
    expect(
      screen.getByRole("article", { name: "Error · Didn't load" }),
    ).toBeInTheDocument();
  });
});
