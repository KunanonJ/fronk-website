import Link from "next/link";
import {
  GithubIcon,
  GlobeIcon,
  HashIcon,
  LinkedInIcon,
  MailIcon,
  SendIcon,
  XIcon,
} from "@/components/icons";
import type { IconComponent } from "@/components/icons/types";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BangkokClock } from "@/components/layout/BangkokClock";
import { FOOTER_COPY } from "@/lib/content/homeMarketing";
import type { ResolvedSiteSettings } from "@/lib/content/siteSettings";

interface SocialLink {
  href: string;
  label: string;
  icon: IconComponent;
}

interface FooterProps {
  site: ResolvedSiteSettings;
}

const FOOTER_NAV = [
  { href: "/#ventures", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/now", label: "Now" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer({ site }: FooterProps) {
  const socialLinks: readonly SocialLink[] = [
    { href: site.socials.x, label: "X", icon: XIcon },
    { href: site.socials.linkedin, label: "LinkedIn", icon: LinkedInIcon },
    { href: site.socials.github, label: "GitHub", icon: GithubIcon },
    { href: site.socials.telegram, label: "Telegram", icon: SendIcon },
    { href: site.socials.farcaster, label: "Farcaster", icon: HashIcon },
    { href: site.socials.website, label: "Website", icon: GlobeIcon },
  ];

  return (
    <footer
      data-site-chrome
      className="mt-24 border-t border-border bg-bg pt-16 pb-10 text-sm text-muted sm:mt-32"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 gap-12 border-b border-border pb-12 min-w-0 sm:grid-cols-2 lg:grid-cols-3">
          <div className="min-w-0 space-y-4">
            <p className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              {FOOTER_COPY.title}
            </p>
            <p className="max-w-sm text-muted">{FOOTER_COPY.line}</p>
            <Button href={FOOTER_COPY.ctaHref} size="md">
              {FOOTER_COPY.ctaLabel}
            </Button>
          </div>

          <div className="min-w-0 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Pages
            </p>
            <ul className="space-y-2">
              {FOOTER_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="underline decoration-transparent underline-offset-4 transition-colors duration-200 hover:text-fg hover:decoration-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              Contact
            </p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 text-fg underline decoration-border underline-offset-4 transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <MailIcon className="h-4 w-4" />
              {site.email}
            </a>
            <p className="flex flex-wrap items-center gap-2 pt-1">
              <span>Bangkok</span>
              <BangkokClock />
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-8 text-xs text-muted">
          <p>
            © {new Date().getFullYear()} {site.shortName}
          </p>
          <p>{site.footerTagline}</p>
        </div>
      </Container>
    </footer>
  );
}
