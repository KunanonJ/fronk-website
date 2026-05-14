import type { Metadata } from "next";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Fronk Kunanon Jarat — email and social links.",
};

const channels = [
  {
    label: "Email",
    sub: "fronk.kunanon@gmail.com",
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "X / Twitter",
    sub: "Long-form threads on building",
    href: siteConfig.socials.x,
    icon: Twitter,
  },
  {
    label: "LinkedIn",
    sub: "Professional history and updates",
    href: siteConfig.socials.linkedin,
    icon: Linkedin,
  },
  {
    label: "GitHub",
    sub: "Open-source contributions and side projects",
    href: siteConfig.socials.github,
    icon: Github,
  },
] as const;

export default function ContactPage() {
  return (
    <Container size="lg" className="py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-muted">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Say hello.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Email is the highest-signal channel. I read everything; I try to reply
          within a week. If you're a founder, builder, or operator with an
          interesting problem, please don't hesitate.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {channels.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="flex items-start gap-4 rounded-xl border border-border bg-subtle/30 p-5 transition-colors hover:border-fg/30 hover:bg-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <c.icon className="mt-0.5 h-5 w-5 text-muted" aria-hidden />
              <div>
                <p className="font-medium">{c.label}</p>
                <p className="mt-0.5 text-sm text-muted">{c.sub}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Container>
  );
}
