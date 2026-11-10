import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const location = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("@/lib/router/navigation", () => ({
  usePathname: () => location.pathname,
}));

import { ChromeProvider } from "@/components/bento/ChromeContext";
import SharePill from "@/components/bento/SharePill";
import SiteHeader from "@/components/bento/SiteHeader";
import { isCurrentRow } from "@/components/bento/SiteMenu";

function renderHeader(extra?: React.ReactNode) {
  return render(
    <ChromeProvider>
      <SiteHeader />
      <main>
        <p>Page body</p>
        {extra}
      </main>
    </ChromeProvider>,
  );
}

const menuButton = () =>
  screen.getByRole("button", { name: /^(Open|Close) menu$/ });
const shareButton = () =>
  screen.getByRole("button", { name: "Share this page" });

afterEach(() => {
  location.pathname = "/";
  vi.unstubAllGlobals();
  document.head.innerHTML = "";
});

describe("SiteHeader", () => {
  it("shows the K mark, the email and three icon buttons", () => {
    renderHeader();
    expect(
      screen.getByRole("link", { name: "Kunanon Jarat, home" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "fronk.kunanon@gmail.com" }),
    ).toHaveAttribute("href", "mailto:fronk.kunanon@gmail.com");
    expect(shareButton()).toHaveAttribute("aria-expanded", "false");
    expect(menuButton()).toHaveAttribute("aria-controls", "site-menu");
    expect(
      screen.getByRole("button", { name: "Switch to night mode" }),
    ).toBeInTheDocument();
  });

  it("opens the menu, moves focus into it, and closes on Escape back to the button", () => {
    renderHeader();
    fireEvent.click(menuButton());
    const nav = screen.getByRole("navigation", { name: "Site" });
    expect(menuButton()).toHaveAttribute("aria-expanded", "true");
    expect(menuButton()).toHaveAccessibleName("Close menu");
    expect(document.activeElement).toBe(
      screen.getByRole("link", { name: "Home" }),
    );
    expect(nav).toHaveAttribute("id", "site-menu");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("navigation", { name: "Site" })).toBeNull();
    expect(document.activeElement).toBe(menuButton());
  });

  it("closes on a click outside the header", () => {
    renderHeader();
    fireEvent.click(menuButton());
    fireEvent.pointerDown(screen.getByText("Page body"));
    expect(screen.queryByRole("navigation", { name: "Site" })).toBeNull();
  });

  it("opens one panel at a time", () => {
    renderHeader();
    fireEvent.click(menuButton());
    fireEvent.click(shareButton());
    expect(screen.queryByRole("navigation", { name: "Site" })).toBeNull();
    expect(
      screen.getByRole("region", { name: "Share this page" }),
    ).toBeInTheDocument();
    expect(shareButton()).toHaveAttribute("aria-expanded", "true");
  });

  it("lists the canvas menu, with Ventures on /#ventures and no blog or press", () => {
    renderHeader();
    fireEvent.click(menuButton());
    const links = screen
      .getByRole("navigation", { name: "Site" })
      .querySelectorAll("a");
    const items = [...links].map((a) => [
      a.textContent,
      a.getAttribute("href"),
    ]);
    expect(items).toEqual([
      ["Home", "/"],
      ["About", "/about"],
      ["Ventures", "/#ventures"],
      ["Portfolio", "/portfolio"],
      ["Skills", "/skills"],
      ["AI engineering", "/topics/forward-deployed-ai-engineering"],
      ["Learn", "/learn"],
      ["Examples", "/examples"],
      ["Stack", "/stack"],
      ["Proof", "/proof"],
      ["Build", "/build"],
      ["Contact me", "/contact"],
    ]);
    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  it("marks the section of a detail page as current", () => {
    location.pathname = "/portfolio/tbh-intranet";
    renderHeader();
    fireEvent.click(menuButton());
    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("lets a hero share pill drive the same panel", () => {
    renderHeader(<SharePill />);
    const pill = screen.getByRole("button", { name: "Share" });
    fireEvent.pointerDown(pill);
    fireEvent.click(pill);
    expect(pill).toHaveAttribute("aria-expanded", "true");
    expect(shareButton()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("share panel", () => {
  it("shares the canonical URL and title, and confirms a copy", async () => {
    document.title = "Portfolio | Kunanon Jarat";
    const canonical = document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = "https://kunanonj.com/portfolio";
    document.head.append(canonical);
    const writeText = vi.fn(async () => {});
    vi.stubGlobal("isSecureContext", true);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    renderHeader();
    fireEvent.click(shareButton());
    expect(screen.getByText("Portfolio | Kunanon Jarat")).toBeInTheDocument();
    expect(screen.getByText("kunanonj.com/portfolio")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Post on X" }).getAttribute("href"),
    ).toBe(
      "https://x.com/intent/post?text=Portfolio%20%7C%20Kunanon%20Jarat&url=https%3A%2F%2Fkunanonj.com%2Fportfolio",
    );
    expect(
      screen.getByRole("link", { name: "Email the link" }).getAttribute("href"),
    ).toMatch(/^mailto:\?subject=/);

    const copy = screen.getByRole("button", { name: /Copy link/ });
    expect(document.activeElement).toBe(copy);
    await act(async () => {
      fireEvent.click(copy);
    });
    expect(writeText).toHaveBeenCalledWith("https://kunanonj.com/portfolio");
    expect(screen.getByText("Link copied")).toBeInTheDocument();
  });

  it("offers More options only where the share sheet exists", () => {
    renderHeader();
    fireEvent.click(shareButton());
    expect(screen.queryByRole("button", { name: "More options" })).toBeNull();
    fireEvent.click(shareButton());

    vi.stubGlobal("navigator", { ...navigator, share: vi.fn(async () => {}) });
    fireEvent.click(shareButton());
    expect(
      screen.getByRole("button", { name: "More options" }),
    ).toBeInTheDocument();
  });
});

describe("isCurrentRow", () => {
  it("matches the exact page or a listed section prefix", () => {
    expect(isCurrentRow("/", { href: "/", match: [] })).toBe(true);
    expect(isCurrentRow("/about", { href: "/", match: [] })).toBe(false);
    expect(
      isCurrentRow("/ventures/gogocash", {
        href: "/#ventures",
        match: ["/ventures/"],
      }),
    ).toBe(true);
    expect(isCurrentRow("/skills/", { href: "/skills", match: [] })).toBe(true);
  });
});

describe("isCurrentRow", () => {
  it("marks only the row whose page it is when a section also matches", async () => {
    const { isCurrentRow } = await import("@/components/bento/SiteMenu");
    const rows = [
      { href: "/topics/forward-deployed-ai-engineering", match: [] },
      { href: "/learn", match: ["/topics/"] },
    ];
    const path = "/topics/forward-deployed-ai-engineering";
    expect(isCurrentRow(path, rows[0]!, rows)).toBe(true);
    expect(isCurrentRow(path, rows[1]!, rows)).toBe(false);
    expect(
      isCurrentRow("/topics/erp-crm-internal-systems", rows[1]!, rows),
    ).toBe(true);
  });
});
