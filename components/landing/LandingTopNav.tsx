"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BadgeCheck,
  Blocks,
  BriefcaseBusiness,
  ChevronDown,
  GraduationCap,
  Hammer,
  Layers,
  LibraryBig,
  Lightbulb,
  PenLine,
  Rocket,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  hero,
  navCta,
  primaryNav,
  type NavIconId,
  type NavItem,
} from "@/lib/content/landing";
import {
  HOME_SECTION_IDS,
  activeSectionAtFocus,
  flattenNavHrefs,
  isMenuChildActive,
  isNavItemActive,
  normalizePath,
  parseHomeSectionHash,
  resolveHomeAwareHref,
  scrollSpySectionIds,
  scrollToHomeSection,
} from "@/lib/landing/nav";

const MENU_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Top-level desktop icons show from lg (1024px). With six links (Skills added
 * 2026-11) the 768-1023px bar only clears the wordmark and Contact without
 * them, and from lg the scrolled pill widens to 800px to keep >=23px clearance.
 */
const DESKTOP_ICON_CLASS = "hidden h-3.5 w-3.5 lg:block";
const SCROLL_SHRINK_Y = 24;

const NAV_ICONS = {
  about: UserRound,
  ventures: Rocket,
  portfolio: BriefcaseBusiness,
  skills: Blocks,
  library: LibraryBig,
  blog: PenLine,
  learn: GraduationCap,
  examples: Lightbulb,
  stack: Layers,
  proof: BadgeCheck,
  build: Hammer,
} satisfies Record<NavIconId, LucideIcon>;

/** Decorative: the label next to it carries the meaning. */
function NavIcon({
  id,
  className = "h-3.5 w-3.5",
}: {
  id?: NavIconId;
  className?: string;
}) {
  if (!id) return null;
  const Icon = NAV_ICONS[id];
  return <Icon className={`shrink-0 opacity-60 ${className}`} aria-hidden />;
}

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

/*
 * visual-redesign Phase 1: inactive links are ink-2 and the active one sits on
 * a Glaze (surface-tint) fill with a small Signal square. Mobile rows are
 * 48 px tall.
 */
function desktopLinkClass(active: boolean) {
  return active
    ? "inline-flex min-h-9 items-center gap-1.5 rounded-full bg-surface-tint px-2.5 py-1 text-sm font-medium text-ink"
    : "inline-flex min-h-9 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm text-ink-2 transition-colors hover:bg-surface-tint hover:text-ink";
}

function mobileLinkClass(active: boolean) {
  return active
    ? "flex min-h-12 items-center gap-2.5 rounded-xl bg-surface-tint px-3 text-sm font-medium text-ink"
    : "flex min-h-12 items-center gap-2.5 rounded-xl px-3 text-sm text-ink-2 transition-colors hover:bg-surface-tint hover:text-ink";
}

/** The active-item marker: a 6 px square in the link colour (Signal, or the lighter blue in dark). */
function ActiveMarker() {
  return <span aria-hidden className="size-1.5 shrink-0 bg-link" />;
}

type LandingTopNavProps = {
  position?: "absolute" | "fixed";
  wordmarkHref?: string;
  resolveHref?: (href: string) => string;
  navId?: string;
};

export default function LandingTopNav({
  position = "fixed",
  wordmarkHref = "/",
  resolveHref = (href) => href,
  navId = "mobile-nav",
}: LandingTopNavProps) {
  const pathname = usePathname() ?? "/";
  const path = normalizePath(pathname);
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [homeSection, setHomeSection] = useState<string | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const isHome = path === "/";
  const activeSection = isHome ? homeSection : null;
  const pos = position === "absolute" ? "absolute" : "fixed";

  const spyItems = useMemo(
    () => flattenNavHrefs(primaryNav, navCta),
    [],
  );
  const hashLinkedSections = useMemo(
    () => scrollSpySectionIds(spyItems),
    [spyItems],
  );

  const hrefForNav = (href: string) =>
    resolveHomeAwareHref(resolveHref(href), path);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_SHRINK_Y);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen && !openMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const onPointer = (event: PointerEvent) => {
      if (!shellRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [openMenu]);

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
    if (!isHome) return;

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

    // Defer the first read so we don't setState in the effect body.
    // Off-home, `activeSection` is already derived as null.
    const raf = window.requestAnimationFrame(updateActiveSection);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [isHome, path]);

  const wordmarkActive = isNavItemActive(
    "/",
    path,
    activeSection,
    hashLinkedSections,
  );

  const closeAll = () => {
    setMenuOpen(false);
    setOpenMenu(null);
  };

  const renderDesktopItem = (item: NavItem) => {
    if (item.type === "link") {
      const active = isNavItemActive(
        item.href,
        path,
        activeSection,
        hashLinkedSections,
      );
      return (
        <li key={item.label}>
          <NavItemAnchor
            href={hrefForNav(item.href)}
            className={desktopLinkClass(active)}
            active={active}
            reducedMotion={prefersReducedMotion}
          >
            <NavIcon id={item.icon} className={DESKTOP_ICON_CLASS} />
            {item.label}
            {active ? <ActiveMarker /> : null}
          </NavItemAnchor>
        </li>
      );
    }

    const menuActive = isMenuChildActive(
      item.children,
      path,
      activeSection,
      hashLinkedSections,
    );
    const expanded = openMenu === item.label;

    return (
      <li key={item.label} className="relative">
        <button
          type="button"
          className={desktopLinkClass(menuActive || expanded)}
          aria-expanded={expanded}
          aria-haspopup="menu"
          onClick={() =>
            setOpenMenu((current) =>
              current === item.label ? null : item.label,
            )
          }
        >
          <NavIcon id={item.icon} className={DESKTOP_ICON_CLASS} />
          {item.label}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              role="menu"
              aria-label={item.label}
              className="absolute left-1/2 top-full z-50 mt-2 min-w-[12rem] -translate-x-1/2 rounded-2xl border border-hairline-strong bg-surface p-1.5 shadow-card"
              initial={
                prefersReducedMotion ? false : { opacity: 0, y: 6, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 4, scale: 0.98 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.28, ease: MENU_EASE }
              }
            >
              {item.children.map((child) => {
                const active = isNavItemActive(
                  child.href,
                  path,
                  activeSection,
                  hashLinkedSections,
                );
                return (
                  <NavItemAnchor
                    key={child.href}
                    href={hrefForNav(child.href)}
                    className={
                      active
                        ? "flex min-h-10 items-center gap-2.5 rounded-xl bg-surface-tint px-3 py-2 text-sm font-medium text-ink"
                        : "flex min-h-10 items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-2 transition-colors hover:bg-surface-tint hover:text-ink"
                    }
                    active={active}
                    reducedMotion={prefersReducedMotion}
                    onClick={closeAll}
                  >
                    <NavIcon id={child.icon} className="h-4 w-4" />
                    {child.label}
                  </NavItemAnchor>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </li>
    );
  };

  const renderMobileTree = () =>
    primaryNav.map((item, index) => {
      if (item.type === "link") {
        const active = isNavItemActive(
          item.href,
          path,
          activeSection,
          hashLinkedSections,
        );
        return (
          <motion.li
            key={item.label}
            initial={prefersReducedMotion ? false : { y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { y: -4, opacity: 0 }}
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
              className={mobileLinkClass(active)}
              active={active}
              reducedMotion={prefersReducedMotion}
              onClick={closeAll}
            >
              <NavIcon id={item.icon} className="h-4 w-4" />
              {item.label}
            </NavItemAnchor>
          </motion.li>
        );
      }

      return (
        <motion.li
          key={item.label}
          className="space-y-0.5"
          initial={prefersReducedMotion ? false : { y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { y: -4, opacity: 0 }}
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
          <p className="px-3 pt-3 font-mono text-label uppercase text-ink-2">
            {item.label}
          </p>
          {item.children.map((child) => {
            const active = isNavItemActive(
              child.href,
              path,
              activeSection,
              hashLinkedSections,
            );
            return (
              <NavItemAnchor
                key={child.href}
                href={hrefForNav(child.href)}
                className={mobileLinkClass(active)}
                active={active}
                reducedMotion={prefersReducedMotion}
                onClick={closeAll}
              >
                <NavIcon id={child.icon} className="h-4 w-4" />
                {child.label}
              </NavItemAnchor>
            );
          })}
        </motion.li>
      );
    });

  const ctaActive = isNavItemActive(
    navCta.href,
    path,
    activeSection,
    hashLinkedSections,
  );

  return (
    <div
      className={`${pos} inset-x-0 top-0 z-50 px-3 pt-3 pointer-events-none`}
    >
      <div
        ref={shellRef}
        className={`pointer-events-auto relative mx-auto w-full transition-[max-width] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? "max-w-[720px] lg:max-w-[800px]" : "max-w-[880px]"
        }`}
      >
        <div
          className={`absolute inset-0 rounded-[1.75rem] border border-hairline-strong bg-surface/85 shadow-card backdrop-blur-md transition-opacity duration-300 ${
            scrolled || menuOpen || openMenu ? "opacity-100" : "opacity-90"
          }`}
          aria-hidden
        />

        <header className="relative flex items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
          <Link
            href={wordmarkHref}
            className="relative z-10 inline-flex min-h-9 shrink-0 items-center text-sm font-semibold tracking-tight text-ink transition-opacity hover:opacity-80"
            aria-current={wordmarkActive ? "page" : undefined}
          >
            {hero.wordmark}
          </Link>

          {/* Optically centred between the wordmark and the wider right group
              (theme toggle + Contact): -ml-8 balances the two gaps so the
              links never touch Contact, even in the 720px scrolled pill. */}
          <nav
            className="absolute left-1/2 top-1/2 -ml-8 hidden -translate-x-1/2 -translate-y-1/2 md:block"
            aria-label="Primary"
          >
            <ul className="flex items-center gap-1">
              {primaryNav.map(renderDesktopItem)}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-2">
            <ThemeToggle />
            <NavItemAnchor
              href={hrefForNav(navCta.href)}
              className="hidden min-h-9 items-center rounded-full bg-ink px-4 text-sm font-medium text-page transition-opacity hover:opacity-90 md:inline-flex"
              active={ctaActive}
              reducedMotion={prefersReducedMotion}
            >
              {navCta.label}
            </NavItemAnchor>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-transform hover:bg-surface-tint motion-safe:active:scale-90 md:hidden"
              aria-expanded={menuOpen}
              aria-controls={navId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => {
                setOpenMenu(null);
                setMenuOpen((open) => !open);
              }}
            >
              <MenuToggleIcon
                open={menuOpen}
                reducedMotion={prefersReducedMotion}
              />
            </button>
          </div>
        </header>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              id={navId}
              aria-label="Primary"
              className="relative overflow-hidden px-2 pb-3 md:hidden"
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
              <ul className="flex flex-col gap-0.5 pt-1">
                {renderMobileTree()}
                <li className="pt-2">
                  <NavItemAnchor
                    href={hrefForNav(navCta.href)}
                    className="flex min-h-12 items-center justify-center rounded-full bg-ink px-3 text-sm font-medium text-page"
                    active={ctaActive}
                    reducedMotion={prefersReducedMotion}
                    onClick={closeAll}
                  >
                    {navCta.label}
                  </NavItemAnchor>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
