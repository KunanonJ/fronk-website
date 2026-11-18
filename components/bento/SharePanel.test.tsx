import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: () => {} }),
}));

vi.mock("@/lib/router/navigation", () => ({
  // A page Phase 7 restyles, with a hero Share pill: not Home, so the nav's
  // scrollspy stays off.
  usePathname: () => "/skills",
  useLocationKey: () => "/skills",
  useChromeLinkProps: (href: string) => ({ href }),
  useReplaceNavigate: () => () => {},
  useAfterNavigation: () => {},
}));

import { ChromeProvider } from "@/components/bento/ChromeContext";
import { readShareTarget } from "@/components/bento/SharePanel";
import SharePanelHost from "@/components/bento/SharePanelHost";
import SharePill from "@/components/bento/SharePill";
import SiteNav from "@/components/profile/site/SiteNav";
import { POPOVER_IDS, isPopoverOpen } from "@/components/profile/site/popover";

/*
 * The share panel as the hero Share pills open it since the Phase 6 cutover
 * (the pill nav has no Share button). These are the share checks of the old
 * header's tests (components/bento/SiteHeader.test.tsx, deleted at the
 * cutover), on today's chrome: an outside press closes it and the nav's other
 * panels never open beside it; a pill drives it; it shares the page's title
 * and canonical URL, never the address bar's; the title keeps the page's
 * language inside the English chrome; "More options" only with a share sheet.
 */

const CANONICAL = "https://kunanonj.com/portfolio";
const TITLE = "Portfolio | Kunanon Jarat";

function renderPage() {
  return render(
    <ChromeProvider>
      <SiteNav />
      <main>
        <p>Page body</p>
        <SharePill />
      </main>
      <SharePanelHost />
    </ChromeProvider>,
  );
}

const pill = () => screen.getByRole("button", { name: "Share" });
const panel = () => screen.queryByRole("region", { name: "Share this page" });

function openShare() {
  fireEvent.pointerDown(pill());
  fireEvent.click(pill());
  expect(panel()).not.toBeNull();
}

function setCanonical(href: string) {
  const link = document.createElement("link");
  link.rel = "canonical";
  link.href = href;
  document.head.append(link);
}

beforeEach(() => {
  document.title = TITLE;
  setCanonical(CANONICAL);
  // The address bar differs from the canonical (a filter and a hash), so a
  // panel that shared location.href would show it.
  window.history.replaceState(null, "", "/portfolio?category=ai-agents#work");
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.head.replaceChildren();
  document.title = "";
  document.documentElement.removeAttribute("lang");
  window.history.replaceState(null, "", "/");
  for (const key of ["clipboard", "share"] as const) {
    Reflect.deleteProperty(navigator, key);
  }
});

describe("readShareTarget", () => {
  it("reads the page's title and its canonical URL, not the address bar", () => {
    expect(window.location.href).not.toBe(CANONICAL);
    expect(readShareTarget()).toEqual({ title: TITLE, url: CANONICAL });
  });

  it("falls back to the address only where the page has no canonical", () => {
    document.head.replaceChildren();
    expect(readShareTarget().url).toBe(window.location.href);
  });
});

describe("share panel", () => {
  it("closes on a press outside it", () => {
    renderPage();
    openShare();
    fireEvent.pointerDown(screen.getByText("Page body"));
    expect(panel()).toBeNull();
    expect(pill()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens one panel at a time: the nav's menu or Say hello closes it", () => {
    renderPage();
    for (const id of [POPOVER_IDS.menu, POPOVER_IDS.nav]) {
      openShare();
      const trigger = document.querySelector<HTMLElement>(
        `[popovertarget="${id}"]`,
      )!;
      const popover = document.getElementById(id)!;
      fireEvent.pointerDown(trigger);
      fireEvent.click(trigger);
      expect(panel(), id).toBeNull();
      expect(isPopoverOpen(popover), id).toBe(true);
      // Closed again before the next round.
      fireEvent.keyDown(document, { key: "Escape" });
      expect(isPopoverOpen(popover), id).toBe(false);
    }
  });

  it("lets a hero share pill drive the panel, open and closed", () => {
    renderPage();
    expect(pill()).toHaveAttribute("aria-expanded", "false");
    expect(pill()).not.toHaveAttribute("aria-controls");
    openShare();
    expect(pill()).toHaveAttribute("aria-expanded", "true");
    expect(pill()).toHaveAttribute("aria-controls", "share-panel");
    expect(panel()).toHaveAttribute("id", "share-panel");
    fireEvent.pointerDown(pill());
    fireEvent.click(pill());
    expect(panel()).toBeNull();
    expect(pill()).toHaveAttribute("aria-expanded", "false");
  });

  it("shares the canonical URL and title, and confirms a copy", async () => {
    const writeText = vi.fn(async () => {});
    vi.stubGlobal("isSecureContext", true);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderPage();
    openShare();
    expect(screen.getByText(TITLE)).toBeInTheDocument();
    expect(screen.getByText("kunanonj.com/portfolio")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Post on X" }).getAttribute("href"),
    ).toBe(
      "https://x.com/intent/post?text=Portfolio%20%7C%20Kunanon%20Jarat&url=https%3A%2F%2Fkunanonj.com%2Fportfolio",
    );
    expect(
      screen
        .getByRole("link", { name: "Share on LinkedIn" })
        .getAttribute("href"),
    ).toBe(
      "https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fkunanonj.com%2Fportfolio",
    );
    expect(
      screen.getByRole("link", { name: "Email the link" }).getAttribute("href"),
    ).toBe(
      "mailto:?subject=Portfolio%20%7C%20Kunanon%20Jarat&body=https%3A%2F%2Fkunanonj.com%2Fportfolio",
    );

    const copy = screen.getByRole("button", { name: /Copy link/ });
    expect(document.activeElement).toBe(copy);
    await act(async () => {
      fireEvent.click(copy);
    });
    expect(writeText).toHaveBeenCalledWith(CANONICAL);
    expect(screen.getByText("Link copied")).toBeInTheDocument();
  });

  it("keeps the page's language on the shared title, inside the English chrome", () => {
    // A Thai hub: <html lang="th"> and a Thai title, in a panel that says
    // lang="en" for its own labels.
    document.documentElement.lang = "th";
    document.title = "วิศวกรรม AI แบบ Forward Deployed";
    renderPage();
    openShare();
    const title = screen.getByText("วิศวกรรม AI แบบ Forward Deployed");
    expect(title).toHaveAttribute("lang", "th");
    expect(screen.getByText("Share", { selector: "p" })).not.toHaveAttribute(
      "lang",
    );
    expect(panel()!.closest("[lang]")).toHaveAttribute("lang", "en");
  });

  it("offers More options only where the share sheet exists, and shares the canonical there", () => {
    renderPage();
    openShare();
    expect(screen.queryByRole("button", { name: "More options" })).toBeNull();
    fireEvent.pointerDown(pill());
    fireEvent.click(pill());

    const share = vi.fn(async () => {});
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
    });
    openShare();
    fireEvent.click(screen.getByRole("button", { name: "More options" }));
    expect(share).toHaveBeenCalledWith({ title: TITLE, url: CANONICAL });
  });
});
