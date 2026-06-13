"use client";

import { usePathname } from "next/navigation";
import { AppFrame } from "@/components/layout/AppFrame";

interface SiteShellProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export function SiteShell({ children, header, footer }: SiteShellProps) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio") ?? false;

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <AppFrame />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:border focus:border-border-strong focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
      >
        Skip to content
      </a>
      {header}
      <main key={pathname} id="main" className="flex-1 animate-fade-up">
        {children}
      </main>
      {footer}
    </>
  );
}
