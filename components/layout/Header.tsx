import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/layout/MobileNav";
import type { ResolvedSiteSettings } from "@/lib/content/siteSettings";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  site: ResolvedSiteSettings;
}

export function Header({ site }: HeaderProps) {
  const navItems = site.navigation.slice(1);

  return (
    <header
      data-site-chrome
      className="sticky top-0 z-40 border-b-2 border-border bg-bg"
    >
      <Container size="xl">
        <div className="flex h-14 items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight hover:text-accent"
            aria-label={`${site.shortName} — home`}
          >
            {site.shortName}
            <span className="text-accent">.</span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm text-muted underline decoration-transparent decoration-2 underline-offset-4",
                  "transition-colors hover:text-fg hover:decoration-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              Bangkok
            </Badge>
            <ThemeToggle />
            <MobileNav items={site.navigation} />
          </div>
        </div>
      </Container>
    </header>
  );
}
