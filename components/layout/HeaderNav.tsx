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
}

/**
 * Desktop primary nav as a client island so it can mark the active route from
 * `usePathname`. The active link wears the foreground colour + a held mint
 * underline; others reveal the underline on hover. The underline is a
 * transform-scaled pseudo-element (compositor-friendly, reduced-motion-safe).
 */
export function HeaderNav({ items }: HeaderNavProps) {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
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
              "label-mono relative text-[0.7rem] transition-colors",
              "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-accent after:transition-transform after:duration-200",
              active
                ? "text-fg after:scale-x-100"
                : "text-muted after:scale-x-0 hover:text-fg hover:after:scale-x-100",
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
