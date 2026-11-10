import { useEffect, useRef } from "react";
import Link from "@/components/navigation/Link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useChrome } from "@/components/bento/ChromeContext";
import { ICON_BUTTON } from "@/components/bento/classes";
import { CloseIcon, MenuIcon, ShareIcon } from "@/components/bento/icons";
import SharePanel from "@/components/bento/SharePanel";
import SiteMenu, { isCurrentRow } from "@/components/bento/SiteMenu";
import { headerLinks, site } from "@/lib/content/landing";
import { usePathname } from "@/lib/router/navigation";
import { cn } from "@/lib/utils/cn";

/** Buttons that open a header panel, including share pills elsewhere on the page. */
const PANEL_TRIGGERS = "[data-panel-trigger]";

/**
 * Site header (bento canvas, design spec 3.2): the K mark and email on the
 * left; share, theme and menu buttons on the right. At 1024 px and wider,
 * three text links sit before the buttons (owner, 10-11-26): the work, the
 * résumé and the AI engineering page, one click from anywhere. One panel
 * opens at a time. Escape closes it and returns focus to its button; a click
 * outside the header closes it; navigating closes it.
 */
export default function SiteHeader() {
  const { panel, toggle, close } = useChrome();
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target || ref.current?.contains(target)) return;
      if (target.closest(PANEL_TRIGGERS)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [panel, close]);

  const menuOpen = panel === "menu";
  const shareOpen = panel === "share";

  return (
    <header
      ref={ref}
      // Every label in the header, its menu and its share panel is English,
      // also on the Thai pages, whose <html> says lang="th".
      lang="en"
      data-site-chrome
      className="kj kj-header relative z-20 flex items-center justify-between gap-4"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <Link
          href="/"
          aria-label="Kunanon Jarat, home"
          className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-tile bg-ink no-underline"
        >
          <span className="text-[21px] leading-none font-bold tracking-[-0.02em] text-page">
            K
          </span>
          <span
            aria-hidden
            className="absolute right-[7px] bottom-[7px] size-[5px] bg-mark"
          />
        </Link>
        <a
          href={`mailto:${site.email}`}
          className="text-base whitespace-nowrap text-ink underline decoration-hairline-strong underline-offset-[6px] max-[561px]:hidden"
        >
          {site.email}
        </a>
      </div>

      <div className="flex items-center gap-2">
        {/* "Primary", beside the menu's "Site": two landmarks, two names. */}
        <nav
          aria-label="Primary"
          className="mr-1 hidden items-center gap-0.5 lg:flex"
        >
          {headerLinks.map((link) => {
            const current = isCurrentRow(pathname, link, headerLinks);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "kj-row relative inline-flex min-h-11 items-center rounded-full px-3.5 text-card font-medium whitespace-nowrap text-ink no-underline",
                  current && "bg-surface-tint",
                )}
              >
                {link.label}
                {/* The tint alone is faint: the mark's square says "here",
                    under the label so no link moves when it appears. */}
                {current ? (
                  <span
                    aria-hidden
                    className="absolute bottom-[7px] left-1/2 size-[5px] -translate-x-1/2 bg-mark"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className={ICON_BUTTON}
          aria-label="Share this page"
          data-panel-trigger
          aria-expanded={shareOpen}
          // The share panel mounts only while open; point at it only then.
          aria-controls={shareOpen ? "share-panel" : undefined}
          onClick={(event) => toggle("share", event.currentTarget)}
        >
          <ShareIcon />
        </button>
        <ThemeToggle />
        <button
          type="button"
          className={ICON_BUTTON}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          data-panel-trigger
          onClick={(event) => toggle("menu", event.currentTarget)}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {shareOpen ? <SharePanel /> : null}
      {/* Always in the HTML, hidden while closed: its links are the only
          site-wide navigation crawlers that don't run JavaScript can follow. */}
      <SiteMenu
        open={menuOpen}
        pathname={pathname}
        onNavigate={() => close()}
      />
    </header>
  );
}
