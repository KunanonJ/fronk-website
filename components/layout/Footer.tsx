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
      className="mt-32 border-t border-border/60 py-16 text-sm text-muted bg-subtle/10"
    >
      <Container size="xl">
        <div className="grid grid-cols-1 gap-10 pb-16 sm:grid-cols-2 md:grid-cols-4 border-b border-border/40">
          <div className="space-y-4">
            <span className="text-fg font-sans font-semibold tracking-tight text-lg">
              {site.shortName}
              <span className="text-accent">.</span>
            </span>
            <p className="text-muted leading-relaxed max-w-[240px]">
              {site.footerTagline}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-fg font-semibold">
              Pages
            </h4>
            <ul className="space-y-2.5">
              {site.navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-fg transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-fg font-semibold">
              Agents
            </h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <Link href="/sitemap.md" className="hover:text-fg transition-colors" target="_blank">sitemap.md</Link>
              </li>
              <li>
                <Link href="/llms.txt" className="hover:text-fg transition-colors" target="_blank">llms.txt</Link>
              </li>
              <li>
                <Link href="/skills.md" className="hover:text-fg transition-colors" target="_blank">skills.md</Link>
              </li>
              <li>
                <Link href="/feed.xml" className="hover:text-fg transition-colors" target="_blank">rss.xml</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-mono text-xs uppercase tracking-wider text-fg font-semibold">
              Contact
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-2 hover:text-fg transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Email me</span>
                </a>
              </li>
              <li>
                <div className="flex flex-wrap gap-3 pt-2">
                  {socialLinks.map(({ href, label, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 hover:border-fg/30 hover:text-fg hover:bg-subtle/40 transition-all duration-200"
                      aria-label={label}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 sm:flex-row sm:items-center">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs opacity-75">
            <span>
              © {year} {site.name}
            </span>
            <span aria-hidden className="text-border">
              ✦
            </span>
            <span>Built in Bangkok</span>
            <span aria-hidden className="text-border">
              ✦
            </span>
            <span>Always shipping</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
