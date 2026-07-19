"use client";

import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { hero, nav } from "@/lib/content/landing";
import {
  HOME_SECTION_IDS,
  activeSectionAtFocus,
  isNavItemActive,
  normalizePath,
  parseHomeSectionHash,
  resolveHomeAwareHref,
  scrollSpySectionIds,
  scrollToHomeSection,
} from "@/lib/landing/nav";

const MENU_EASE = [0.22, 1, 0.36, 1] as const;

function MenuToggleIcon({
  open,
  reducedMotion,
}: {
  open: boolean;
  reducedMotion: boolean | null;
}) {
  const duration = reducedMotion ? 0 : 0.35;
  const transition = { duration, ease: MENU_EASE };

  return (
    <span className="relative block h-3.5 w-5" aria-hidden="true">
      <motion.span
        className="absolute left-0 top-0 block h-[1.5px] w-full origin-center rounded-full bg-current"
        animate={open ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
      <motion.span
        className="absolute left-0 top-[6px] block h-[1.5px] w-full origin-center rounded-full bg-current"
        animate={open ? { opacity: 0, scaleX: 0.35 } : { opacity: 1, scaleX: 1 }}
        transition={transition}
      />
      <motion.span
        className="absolute left-0 top-[12px] block h-[1.5px] w-full origin-center rounded-full bg-current"
        animate={open ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={transition}
      />
    </span>
  );
}

function NavItemAnchor({
  href,
  className,
  active,
  reducedMotion,
  onClick,
  children,
}: {
  href: string;
  className: string;
  active: boolean;
  reducedMotion: boolean | null;
  onClick?: () => void;
  children: ReactNode;
}) {
  const behavior: ScrollBehavior = reducedMotion ? "auto" : "smooth";

  /* In-page hash: plain anchor + forced scroll (same-hash re-clicks are no-ops otherwise). */
  if (href.startsWith("#")) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      const id = parseHomeSectionHash(href);
      if (!id) {
        onClick?.();
        return;
      }
      event.preventDefault();
      const url = `${window.location.pathname}${window.location.search}#${id}`;
      if (window.location.hash !== `#${id}`) {
        window.history.pushState(null, "", url);
      }
      scrollToHomeSection(id, behavior);
      onClick?.();
    };

    return (
      <a
        href={href}
        className={className}
        aria-current={active ? "true" : undefined}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  /* Cross-page hash: let the router change path, then home hash effect scrolls. */
  if (href.startsWith("/#")) {
    return (
      <Link
        href={href}
        scroll={false}
        className={className}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function navItemClassName(active: boolean, mobile = false) {
  if (mobile) {
    return active
      ? "flex min-h-11 items-center rounded-lg bg-white/15 px-3 text-sm font-medium text-[#E1E0CC]"
      : "flex min-h-11 items-center rounded-lg px-3 text-sm text-[#E1E0CC]/80 transition-colors hover:bg-white/10 hover:text-[#E1E0CC]";
  }

  return active
    ? "inline-flex min-h-9 items-center rounded-md bg-white/15 px-2.5 py-1 text-[10px] font-medium text-[#E1E0CC] sm:text-xs md:min-h-0 md:text-sm"
    : "inline-flex min-h-9 items-center rounded-md px-2.5 py-1 text-[10px] text-[#E1E0CC]/70 transition-colors hover:bg-white/10 hover:text-[#E1E0CC] sm:text-xs md:min-h-0 md:text-sm";
}

type LandingTopNavProps = {
  /**
   * Viewport-fixed by default so the menu stays available while scrolling.
   * Pass `absolute` only when the nav must stay inside a framed surface.
   */
  position?: "absolute" | "fixed";
  /** When set, the mobile wordmark links here (e.g. `/` on Showcase) */
  wordmarkHref?: string;
  /** Map content hrefs (`#about`) for the current page */
  resolveHref?: (href: string) => string;
  navId?: string;
};

export default function LandingTopNav({
  position = "fixed",
  wordmarkHref,
  resolveHref = (href) => href,
  navId = "mobile-nav",
}: LandingTopNavProps) {
  const pathname = usePathname() ?? "/";
  const path = normalizePath(pathname);
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [homeSection, setHomeSection] = useState<string | null>(null);
  const isHome = path === "/";
  /** Section highlight only applies on `/`; derive null off-home (no effect setState). */
  const activeSection = isHome ? homeSection : null;
  const pos = position === "absolute" ? "absolute" : "fixed";
  const hashLinkedSections = useMemo(() => scrollSpySectionIds(nav), []);

  const hrefForNav = (href: string) =>
    resolveHomeAwareHref(resolveHref(href), path);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const behavior: ScrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    const scrollToCurrentHash = () => {
      const id = parseHomeSectionHash(window.location.hash);
      if (!id) return;
      scrollToHomeSection(id, behavior);
    };

    // Next may restore scroll-to-top after soft nav; retry past that tick.
    let rafInner = 0;
    const rafOuter = window.requestAnimationFrame(() => {
      rafInner = window.requestAnimationFrame(scrollToCurrentHash);
    });
    const timer = window.setTimeout(scrollToCurrentHash, 120);
    window.addEventListener("hashchange", scrollToCurrentHash);

    return () => {
      window.cancelAnimationFrame(rafOuter);
      window.cancelAnimationFrame(rafInner);
      window.clearTimeout(timer);
      window.removeEventListener("hashchange", scrollToCurrentHash);
    };
  }, [isHome, path, prefersReducedMotion]);

  useEffect(() => {
    if (!isHome) {
      setHomeSection(null);
      return;
    }

    /** Classic top-crossed spy over all home sections (+ short-footer band). */
    const updateActiveSection = () => {
      const focusY = window.innerHeight * 0.3;
      const sections = HOME_SECTION_IDS.flatMap((id) => {
        const el = document.getElementById(id);
        if (!el) return [];
        const rect = el.getBoundingClientRect();
        return [{ id, top: rect.top, bottom: rect.bottom }];
      });
      setHomeSection(
        activeSectionAtFocus(sections, focusY, window.innerHeight),
      );
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [isHome, path]);

  const wordmarkClass =
    "text-xs font-medium tracking-wide text-[#E1E0CC] transition-opacity hover:opacity-80";

  return (
    <>
      <nav
        className={`${pos} left-1/2 top-0 z-50 hidden max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-b-2xl bg-black px-3 py-2 sm:px-4 md:block md:rounded-b-3xl md:px-8`}
        aria-label="Primary"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-x-4 md:gap-x-6 lg:gap-x-8">
          {nav.map((item) => {
            const active = isNavItemActive(
              item.href,
              path,
              activeSection,
              hashLinkedSections,
            );
            return (
              <li key={item.href}>
                <NavItemAnchor
                  href={hrefForNav(item.href)}
                  className={navItemClassName(active)}
                  active={active}
                  reducedMotion={prefersReducedMotion}
                >
                  {item.label}
                </NavItemAnchor>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={`${pos} left-1/2 top-0 z-[51] flex w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 justify-center md:hidden`}
      >
        <div className="w-full rounded-b-2xl bg-black px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            {wordmarkHref ? (
              <Link href={wordmarkHref} className={wordmarkClass}>
                {hero.wordmark}
              </Link>
            ) : (
              <span className={wordmarkClass}>{hero.wordmark}</span>
            )}
            <motion.button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary"
              aria-expanded={menuOpen}
              aria-controls={navId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
              transition={{ duration: 0.15 }}
            >
              <MenuToggleIcon
                open={menuOpen}
                reducedMotion={prefersReducedMotion}
              />
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
            {menuOpen && (
              <motion.nav
                id={navId}
                aria-label="Primary"
                className="overflow-hidden"
                initial={
                  prefersReducedMotion ? false : { height: 0, opacity: 0 }
                }
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.4, ease: MENU_EASE }
                }
              >
                <ul className="flex flex-col gap-0.5 pb-2 pt-1">
                  {nav.map((item, index) => {
                    const active = isNavItemActive(
                      item.href,
                      path,
                      activeSection,
                      hashLinkedSections,
                    );
                    return (
                      <motion.li
                        key={item.href}
                        initial={
                          prefersReducedMotion ? false : { y: 8, opacity: 0 }
                        }
                        animate={{ y: 0, opacity: 1 }}
                        exit={
                          prefersReducedMotion
                            ? undefined
                            : { y: -4, opacity: 0 }
                        }
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : {
                                duration: 0.3,
                                delay: 0.05 + index * 0.04,
                                ease: MENU_EASE,
                              }
                        }
                      >
                        <NavItemAnchor
                          href={hrefForNav(item.href)}
                          className={navItemClassName(active, true)}
                          active={active}
                          reducedMotion={prefersReducedMotion}
                          onClick={() => setMenuOpen(false)}
                        >
                          {item.label}
                        </NavItemAnchor>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
