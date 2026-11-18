import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SiteNav from "@/components/profile/site/SiteNav";

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

  it("carries the redesign's token scope itself, for the pages Phase 7 restyles", () => {
    expect(html).toMatch(/<header[^>]*data-design="profile"/);
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
