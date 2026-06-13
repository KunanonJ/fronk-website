import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";
import type { ResolvedSiteSettings } from "@/lib/content/siteSettings";

interface HeaderProps {
  site: ResolvedSiteSettings;
}

export function Header({ site }: HeaderProps) {
  const navItems = site.navigation.slice(1);

  return (
    <header
      data-site-chrome
      className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60"
    >
      <Container size="xl">
        <div className="flex h-14 items-center justify-between gap-6">
          <Link
            href="/"
            className="font-semibold tracking-tight hover:text-accent"
            aria-label={`${site.shortName} — home`}
          >
            {site.shortName}
            <span className="text-accent">.</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-subtle hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav items={site.navigation} />
          </div>
        </div>
      </Container>
    </header>
  );
}
