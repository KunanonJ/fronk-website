import Link from "next/link";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { FullscreenMenu } from "@/components/layout/FullscreenMenu";
import { Button } from "@/components/ui/Button";
import type { ResolvedSiteSettings } from "@/lib/content/siteSettings";

/** Primary chrome nav — Work / About / Contact. */
export const PRIMARY_NAV = [
  { href: "/ventures", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

interface HeaderProps {
  site: ResolvedSiteSettings;
}

/**
 * FogLAMP-mood chrome: wordmark left, muted nav, Contact pill on desktop.
 */
export function Header({ site }: HeaderProps) {
  const menuNav = [
    { href: "/", label: "Home" },
    ...PRIMARY_NAV,
    { href: "/writing", label: "Writing" },
    { href: "/now", label: "Now" },
  ];
  const socialItems = [
    { href: site.socials.x, label: "X / Twitter" },
    { href: site.socials.linkedin, label: "LinkedIn" },
    { href: site.socials.github, label: "GitHub" },
    { href: site.socials.telegram, label: "Telegram" },
    { href: site.socials.farcaster, label: "Farcaster" },
    { href: site.socials.website, label: "Website" },
  ];

  return (
    <header data-site-chrome className="absolute inset-x-0 top-0 z-50 text-fg">
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-4 px-5 sm:px-8 md:px-10">
        <Link
          href="/"
          className="font-display text-sm font-medium tracking-tight text-fg transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          aria-label={`${site.shortName} — home`}
        >
          {site.shortName}
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <HeaderNav items={PRIMARY_NAV} />
          <Button
            href="/contact"
            size="sm"
            className="hidden md:inline-flex"
          >
            Contact
          </Button>
          <div className="md:hidden">
            <FullscreenMenu navItems={menuNav} socialItems={socialItems} />
          </div>
        </div>
      </div>
    </header>
  );
}
