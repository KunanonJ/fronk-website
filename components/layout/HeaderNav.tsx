"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
}

interface HeaderNavProps {
  items: readonly NavItem[];
  className?: string;
}

/**
 * Desktop primary nav — Work / About / Contact style.
 */
export function HeaderNav({ items, className }: HeaderNavProps) {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className={cn("hidden items-center gap-8 md:flex", className)}
      aria-label="Primary"
    >
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
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
