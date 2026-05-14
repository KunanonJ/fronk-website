import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border/60 py-10 text-sm text-muted">
      <Container size="xl">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>

          <ul className="flex items-center gap-4">
            <li>
              <Link
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 hover:text-fg"
                aria-label="Email"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </Link>
            </li>
            <li>
              <a
                href={siteConfig.socials.x}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-fg"
                aria-label="X (Twitter)"
              >
                <Twitter className="h-4 w-4" />
                <span className="hidden sm:inline">X</span>
              </a>
            </li>
            <li>
              <a
                href={siteConfig.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-fg"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
            </li>
            <li>
              <a
                href={siteConfig.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-fg"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
