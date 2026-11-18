import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SiteNav from "@/components/profile/site/SiteNav";

/*
 * The pill nav (design spec 7.1): the server HTML carries the bar, the Primary
 * links and both popovers, so the links work before any script runs.
 */

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

describe("SiteNav", () => {
  const html = renderToString(<SiteNav />);

  it("is the fixed chrome header, in English, marked for print and the audits", () => {
    expect(html).toMatch(/<header[^>]*data-site-chrome="true"[^>]*lang="en"/);
    expect(html).toContain('class="pf-nav"');
  });

  it("names the name link and the Primary links, with their preview addresses", () => {
    expect(html).toContain('aria-label="Kunanon Jarat, home"');
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain('href="/preview#work"');
    expect(html).toContain('href="/preview#about"');
    expect(html).toContain('href="/preview#journey"');
    expect(html).toContain('href="/resume"');
  });

  it("carries the Menu button and Say hello, each naming its popover", () => {
    expect(html).toMatch(/popovertarget="site-menu"/i);
    expect(html).toMatch(/popovertarget="say-hello-nav"/i);
    expect(html).toContain('aria-label="Open menu"');
    expect(html).toContain('aria-label="Switch to night mode"');
  });

  it("starts with no section marked: the scrollspy sets it after hydration", () => {
    expect(html).not.toContain('aria-current="location"');
  });
});
