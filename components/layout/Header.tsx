import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeaderNav } from "@/components/layout/HeaderNav";
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
      className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-sm"
    >
      <Container size="xl">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            aria-label={`${site.shortName} — home`}
          >
            <Logo />
          </Link>

          <HeaderNav items={navItems} />

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
