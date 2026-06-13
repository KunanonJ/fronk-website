import type { Metadata } from "next";
import {
  Github,
  Globe,
  Hash,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Twitter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { PortableText } from "@/components/PortableText";
import { Prose } from "@/components/ui/Prose";
import { resolveSiteSettings } from "@/lib/content/siteSettings";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { fetchSiteSettings, fetchStandardPage } from "@/lib/sanity/fetch";
import { cssVar } from "@/lib/utils/cssVar";

export const revalidate = 60;

const DEFAULT_CONTACT_INTRO =
  "Email is the highest-signal channel. I read everything; I try to reply within a week. If you're a founder, builder, or operator with an interesting problem, please don't hesitate.";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStandardPage("contact");
  const page = resolveStandardPage("contact", cms);
  return {
    title: page.metadata.title,
    description: page.metadata.description,
  };
}

interface Channel {
  label: string;
  sub: string;
  href?: string;
  copy?: string;
  icon: LucideIcon;
}

const cardClasses =
  "flex items-start gap-4 rounded-xl border border-border bg-subtle/30 p-5 transition-colors hover:border-fg/30 hover:bg-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export default async function ContactPage() {
  const { isEnabled: preview } = await draftMode();
  const [cms, settingsCms] = await Promise.all([
    fetchStandardPage("contact", { preview }),
    fetchSiteSettings({ preview }),
  ]);
  const page = resolveStandardPage("contact", cms);
  const site = resolveSiteSettings(settingsCms);

  const channels: readonly Channel[] = [
    {
      label: "Email",
      sub: site.email,
      href: `mailto:${site.email}`,
      icon: Mail,
    },
    {
      label: "X / Twitter",
      sub: "@fkj98",
      href: site.socials.x,
      icon: Twitter,
    },
    {
      label: "LinkedIn",
      sub: "/in/kunanonj",
      href: site.socials.linkedin,
      icon: Linkedin,
    },
    {
      label: "Telegram",
      sub: "@fkj98",
      href: site.socials.telegram,
      icon: Send,
    },
    {
      label: "Discord",
      sub: site.discordHandle,
      copy: site.discordHandle,
      icon: MessageCircle,
    },
    {
      label: "GitHub",
      sub: "@KunanonJ",
      href: site.socials.github,
      icon: Github,
    },
    {
      label: "Farcaster",
      sub: "@fronk98",
      href: site.socials.farcaster,
      icon: Hash,
    },
    {
      label: "Website",
      sub: "gogocash.co",
      href: site.socials.website,
      icon: Globe,
    },
  ];

  return (
    <Container size="lg" className="py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-muted">
          {page.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {page.heading}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {page.description || DEFAULT_CONTACT_INTRO}
        </p>
      </header>

      {cms?.body && cms.body.length > 0 ? (
        <Prose className="mb-12">
          <PortableText value={cms.body} />
        </Prose>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {channels.map((c, i) => {
          const Icon = c.icon;
          const inner = (
            <>
              <Icon className="mt-0.5 h-5 w-5 text-muted" aria-hidden />
              <div>
                <p className="font-medium">{c.label}</p>
                <p className="mt-0.5 text-sm text-muted">{c.sub}</p>
              </div>
            </>
          );

          const animationStyle = cssVar("--i", i);

          if (c.href) {
            const isExternal = c.href.startsWith("http");
            return (
              <li
                key={c.label}
                className="animate-fade-up stagger"
                style={animationStyle}
              >
                <a
                  href={c.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={cardClasses}
                >
                  {inner}
                </a>
              </li>
            );
          }

          return (
            <li
              key={c.label}
              className={`${cardClasses} animate-fade-up stagger`}
              style={animationStyle}
            >
              {inner}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
