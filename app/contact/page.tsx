import type { Metadata } from "next";
import { Globe, Hash, Mail, MessageCircle, Send } from "lucide-react";
import { GithubIcon, LinkedInIcon, XIcon } from "@/components/icons/brand-icons";
import type { IconComponent } from "@/components/icons/types";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { PortableText } from "@/components/PortableText";
import { Prose } from "@/components/ui/Prose";
import { PageHeader } from "@/components/layout/PageHeader";
import { resolveSiteSettings } from "@/lib/content/siteSettings";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { fetchSiteSettings, fetchStandardPage } from "@/lib/sanity/fetch";

export const revalidate = 60;

const DEFAULT_CONTACT_INTRO =
  "Email is the highest-signal channel. I read everything; I try to reply within a week. If you're a founder, builder, or operator with an interesting problem, please don't hesitate.";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStandardPage("contact");
  const page = resolveStandardPage("contact", cms);
  return {
    title: page.metadata.title,
    description: page.metadata.description,
    alternates: { canonical: "/contact" },
  };
}

interface Channel {
  label: string;
  sub: string;
  href?: string;
  copy?: string;
  icon: IconComponent;
}

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
      icon: XIcon,
    },
    {
      label: "LinkedIn",
      sub: "/in/kunanonj",
      href: site.socials.linkedin,
      icon: LinkedInIcon,
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
      icon: GithubIcon,
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
    <Container size="lg" className="py-14 sm:py-20 lg:py-24">
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.heading}
        description={page.description || DEFAULT_CONTACT_INTRO}
      />

      {cms?.body && cms.body.length > 0 ? (
        <Prose className="mb-12">
          <PortableText value={cms.body} />
        </Prose>
      ) : null}

      {/* Channels — a single hairline panel of mono-labelled rows. Mint accent
          is earned only by rows that are actual links; the copy-only Discord
          handle stays monochrome. */}
      <section aria-label="Contact channels" className="panel">
        <p className="label-mono flex items-center justify-between gap-4 px-5 py-3 text-subtle rule-hud first:border-t-0">
          <span>Channels</span>
          <span>{channels.length} open</span>
        </p>

        <ul>
          {channels.map((c) => {
            const Icon = c.icon;
            const isExternal = c.href?.startsWith("http");

            const value = c.href ? (
              <a
                href={c.href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent after:absolute after:inset-0 active:text-accent active:decoration-accent"
              >
                {c.sub}
              </a>
            ) : (
              <span className="text-fg">{c.sub}</span>
            );

            return (
              <li
                key={c.label}
                className="relative flex items-center justify-between gap-4 rule-hud px-5 py-4"
              >
                <span className="label-mono inline-flex flex-shrink-0 items-center gap-3 text-fg">
                  <Icon className="h-4 w-4 text-muted" aria-hidden />
                  {c.label}
                </span>
                <span className="min-w-0 break-words [overflow-wrap:anywhere] text-right font-mono text-sm">
                  {value}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
