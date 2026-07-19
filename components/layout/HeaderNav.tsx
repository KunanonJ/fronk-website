"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { isHashHref, normalizePath, parseHomeSectionHash } from "@/lib/landing/nav";

interface NavItem {
  href: string;
  label: string;
}

interface HeaderNavProps {
  items: readonly NavItem[];
  className?: string;
}

function isRouteActive(href: string, pathname: string, hash: string): boolean {
  const path = normalizePath(pathname);

  if (isHashHref(href)) {
    const section = parseHomeSectionHash(href);
    return path === "/" && section !== null && hash === `#${section}`;
  }

  if (href === "/") {
    return path === "/" && hash === "";
  }

  return path === href || path.startsWith(`${href}/`);
}

/**
 * Desktop primary nav — Work / About / Contact style.
 */
export function HeaderNav({ items, className }: HeaderNavProps) {
  const pathname = usePathname() ?? "/";
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return (
    <nav
      className={cn("hidden items-center gap-8 md:flex", className)}
      aria-label="Primary"
    >
      {items.map((item) => {
        const active = isRouteActive(item.href, pathname, hash);
        const hrefHasHash = isHashHref(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            scroll={hrefHasHash ? false : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative text-sm tracking-tight text-muted transition-colors duration-200",
              active ? "text-fg" : "hover:text-fg",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
