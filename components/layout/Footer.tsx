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
import { siteConfig } from "@/lib/site";

interface SocialLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const socialLinks: readonly SocialLink[] = [
  { href: siteConfig.socials.x, label: "X", icon: Twitter },
  { href: siteConfig.socials.linkedin, label: "LinkedIn", icon: Linkedin },
  { href: siteConfig.socials.github, label: "GitHub", icon: Github },
  { href: siteConfig.socials.telegram, label: "Telegram", icon: Send },
  { href: siteConfig.socials.farcaster, label: "Farcaster", icon: Hash },
  { href: siteConfig.socials.website, label: "Website", icon: Globe },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 py-10 text-sm text-muted">
      <Container size="xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>

          <ul className="flex flex-wrap items-center gap-4">
            <li>
              <Link
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 hover:text-fg"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
              </Link>
            </li>
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-fg"
                  aria-label={label}
                  title={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
