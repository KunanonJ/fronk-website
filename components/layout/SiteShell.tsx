"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface SiteShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * Public site chrome. Header is absolute (overlays home hero).
 * Non-home pages get top padding so content clears the floating header.
 */
export function SiteShell({ children, header, footer }: SiteShellProps) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio") ?? false;
  const isHome = pathname === "/";

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:border focus:border-border-strong focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      {header}
      <main
        key={pathname}
        id="main"
        className={cn(
          "flex-1 motion-safe:animate-fade-in",
          !isHome && "pt-16",
        )}
      >
        {children}
      </main>
      {footer}
    </>
  );
}
