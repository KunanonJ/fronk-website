"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { nav } from "@/lib/site";
import { cn } from "@/lib/utils/cn";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Close the menu when the route changes — pathname is the only signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-fg transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:hidden"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <>
          {/* Visual backdrop. role="presentation" + aria-hidden keep it out of
              the accessibility tree — the panel itself is the dialog. */}
          <div
            role="presentation"
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-40 cursor-default bg-bg/60 backdrop-blur-sm animate-fade-in md:hidden"
          />
          <div
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-x-0 top-14 z-50 border-b border-border bg-bg shadow-xl animate-slide-down md:hidden"
          >
            <nav className="flex flex-col py-2" aria-label="Mobile primary">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "px-6 py-3 text-base transition-colors hover:bg-subtle",
                      active ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
