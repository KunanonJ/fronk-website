import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SiteNav from "@/components/profile/site/SiteNav";
import { PORTRAIT_COLOURS, PORTRAIT_SMALL } from "@/lib/brand/pixelPortrait";

/*
 * The pill nav (design spec 7.1 to 7.3): the server HTML carries the bar, the
 * Primary links and both popovers, so the links work before any script runs.
 * The name link's rules are checked here with the router replaced by a spy.
 */

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

const ROUTE = vi.hoisted(() => ({
  pathname: "/",
  replace: vi.fn(),
}));

vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => ROUTE.pathname,
  useLocationKey: () => ROUTE.pathname,
  useChromeLinkProps: (href: string) => ({ href }),
  useReplaceNavigate: () => ROUTE.replace,
  notFound: () => {
    throw new Error("notFound");
  },
}));

describe("SiteNav, server HTML", () => {
  const html = renderToString(<SiteNav />);

  it("is the fixed chrome header, in English, marked for print and the audits", () => {
    expect(html).toMatch(/<header[^>]*data-site-chrome="true"[^>]*lang="en"/);
    expect(html).toContain('class="pf-nav"');
  });

  it("names the name link and the Primary links, with their live addresses", () => {
    expect(html).toContain('aria-label="Kunanon Jarat, home"');
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain('href="/#work"');
    expect(html).toContain('href="/#about"');
    expect(html).toContain('href="/#journey"');
    expect(html).toContain('href="/resume"');
  });

  it("names the Menu button and Say hello by their popovers, without script state", () => {
    expect(html).toMatch(/popovertarget="site-menu"/i);
    expect(html).toMatch(/popovertarget="say-hello-nav"/i);
    // Script writes aria-expanded and the names; the server HTML has neither.
    expect(html).not.toContain("aria-expanded");
    expect(html).not.toContain('aria-label="Open menu"');
    expect(html).toContain('aria-label="Switch to night mode"');
  });

  it("marks nothing as current before the scrollspy has spoken", () => {
    expect(html).not.toContain("aria-current");
    expect(html).not.toContain("data-status");
  });

  it("keeps Say hello's panel beside the bar's row, not inside it", () => {
    // DOMParser builds the markup as an inert document: no scripts run.
    const dom = new DOMParser().parseFromString(html, "text/html");
    expect(dom.querySelector(".pf-nav__row #say-hello-nav")).toBeNull();
    expect(dom.querySelector("header.pf-nav > #say-hello-nav")).not.toBeNull();
  });

  it("draws the avatar's wink hidden, as the last layer, over one eye", () => {
    const dom = new DOMParser().parseFromString(html, "text/html");
    const avatar = dom.querySelector(".pf-nav__name svg.pf-nav__avatar")!;
    const wink = avatar.querySelector("path.pf-nav__wink")!;
    expect(wink).not.toBeNull();
    expect(avatar.lastElementChild).toBe(wink);
    // Hidden at rest, without the stylesheet as well: the page at rest is
    // drawn as before.
    expect(wink.getAttribute("visibility")).toBe("hidden");
    expect(wink.getAttribute("fill")).toBe(PORTRAIT_COLOURS.e);
    // Row 7, columns 9 and 10 of the 16 x 16 cut: an eye, white then pupil.
    expect(wink.getAttribute("d")).toBe("M9 7h2v1H9z");
    expect(PORTRAIT_SMALL[7]!.slice(9, 11)).toBe("we");
  });
});

/*
 * The wink (now-building-and-genz Phase 5) keeps the visitor's trait: it is
 * drawn over the dressed avatar, and not at all where shades cover the eye.
 */
describe("SiteNav, the avatar's wink with a trait", () => {
  afterEach(() => localStorage.clear());

  const wear = (id: string) => {
    localStorage.setItem("pf-portrait-found", JSON.stringify([id]));
    localStorage.setItem("pf-portrait-worn", id);
  };
  const fills = (container: HTMLElement) =>
    [...container.querySelectorAll(".pf-nav__avatar path[fill]")].map((path) =>
      path.getAttribute("fill"),
    );

  it("winks through gold glasses, which leave the eyes showing", async () => {
    wear("glasses");
    const { container } = render(<SiteNav />);
    await waitFor(() => expect(fills(container)).toContain("#e3b341"));
    expect(container.querySelector(".pf-nav__wink")).not.toBeNull();
  });

  it("does not wink behind shades, and keeps them on", async () => {
    wear("shades");
    const { container } = render(<SiteNav />);
    await waitFor(() => expect(fills(container)).toContain("#2a2440"));
    expect(container.querySelector(".pf-nav__wink")).toBeNull();
  });
});

describe("SiteNav, the name link", () => {
  beforeEach(() => {
    ROUTE.pathname = "/";
    ROUTE.replace.mockClear();
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  const name = () => screen.getByRole("link", { name: "Kunanon Jarat, home" });

  it("returns to the top smoothly on Home without a hash", () => {
    render(<SiteNav />);
    const link = name();
    fireEvent.click(link);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
    expect(ROUTE.replace).not.toHaveBeenCalled();
  });

  it("replaces the entry with a plain Home when a hash is present, and leaves scrolling to the router", () => {
    window.history.replaceState(null, "", "/#work");
    render(<SiteNav />);
    fireEvent.click(name());
    expect(ROUTE.replace).toHaveBeenCalledWith("/");
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("leaves a modified click to the browser (a new tab), and does not prevent it", () => {
    render(<SiteNav />);
    const notPrevented = fireEvent.click(name(), { ctrlKey: true });
    expect(notPrevented).toBe(true);
    expect(fireEvent.click(name(), { metaKey: true })).toBe(true);
    expect(fireEvent.click(name(), { shiftKey: true })).toBe(true);
    expect(fireEvent.click(name(), { altKey: true })).toBe(true);
    expect(fireEvent.click(name(), { button: 1 })).toBe(true);
    expect(ROUTE.replace).not.toHaveBeenCalled();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("follows the router off Home, without preventing the click", () => {
    ROUTE.pathname = "/skills";
    render(<SiteNav />);
    expect(fireEvent.click(name())).toBe(true);
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(ROUTE.replace).not.toHaveBeenCalled();
  });
});
