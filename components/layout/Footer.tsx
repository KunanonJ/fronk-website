import Link from "next/link";
import {
  Github,
  Globe,
  Hash,
  Linkedin,
  Mail,
  Send,
  Twitter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import type { ResolvedSiteSettings } from "@/lib/content/siteSettings";

interface SocialLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface FooterProps {
  site: ResolvedSiteSettings;
}

export function Footer({ site }: FooterProps) {
  const year = new Date().getFullYear();

  const socialLinks: readonly SocialLink[] = [
    { href: site.socials.x, label: "X", icon: Twitter },
    { href: site.socials.linkedin, label: "LinkedIn", icon: Linkedin },
    { href: site.socials.github, label: "GitHub", icon: Github },
    { href: site.socials.telegram, label: "Telegram", icon: Send },
    { href: site.socials.farcaster, label: "Farcaster", icon: Hash },
    { href: site.socials.website, label: "Website", icon: Globe },
  ];

  return (
    <footer
      data-site-chrome
      className="mt-32 border-t border-border pt-16 text-sm text-muted"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 gap-10 border-b border-border pb-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <span className="font-display text-2xl font-bold tracking-tight text-fg">
              {site.shortName}
              <span className="text-accent">.</span>
            </span>
            <p className="max-w-xs leading-relaxed">{site.footerTagline}</p>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-fg">
              Pages
            </p>
            <ul className="space-y-2">
              {site.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="underline decoration-transparent underline-offset-4 hover:text-fg hover:decoration-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-widest text-fg">
              Contact
            </p>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-2 underline decoration-accent underline-offset-4 hover:text-fg"
            >
              <Mail className="h-4 w-4" />
              Email me
            </a>
            <div className="flex flex-wrap gap-2 pt-2">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 w-11 items-center justify-center border-brutal bg-surface transition-colors hover:bg-subtle hover:text-fg"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-8">
          <Badge variant="outline">© {year}</Badge>
          <Badge variant="outline">Built in Bangkok</Badge>
          <Badge variant="outline">Always shipping</Badge>
        </div>
      </Container>

      {/* Giant wordmark rising out of the dark — the matveyan footer signature.
          Gradient is brighter at the baseline, fading upward, so the letters
          appear to emerge. Decorative; clipped at the viewport edges. */}
      <div
        aria-hidden
        className="mt-12 select-none overflow-hidden px-2 leading-none"
      >
        <span className="block bg-gradient-to-t from-fg/[0.22] to-fg/[0.04] bg-clip-text text-center font-display text-wordmark font-bold uppercase tracking-tighter text-transparent">
          {site.shortName}
        </span>
      </div>
    </footer>
  );
}
