"use client";

import { usePathname } from "next/navigation";

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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-fg"
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
