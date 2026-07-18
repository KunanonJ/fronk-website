import type { Metadata } from "next";
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
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { PortableText } from "@/components/PortableText";
import { Prose } from "@/components/ui/Prose";
import { ContactForm } from "@/components/contact/ContactForm";
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
      icon: MailIcon,
    },
    { label: "X / Twitter", sub: "@fkj98", href: site.socials.x, icon: XIcon },
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
      icon: SendIcon,
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
      icon: HashIcon,
    },
    {
      label: "Website",
      sub: "gogocash.co",
      href: site.socials.website,
      icon: GlobeIcon,
    },
  ];

  return (
    <Container size="lg" className="py-14 sm:py-20 lg:py-24">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        {page.eyebrow}
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-fg sm:text-7xl">
        {page.heading}
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {page.description || DEFAULT_CONTACT_INTRO}
      </p>

      {cms?.body && cms.body.length > 0 ? (
        <Prose className="mb-12 mt-8">
          <PortableText value={cms.body} />
        </Prose>
      ) : null}

      <ContactForm email={site.email} />

      <section aria-label="Contact channels" className="mt-16 border-t border-border">
        <ul>
          {channels.map((c) => {
            const Icon = c.icon;
            const isExternal = c.href?.startsWith("http");
            return (
              <li
                key={c.label}
                className="flex items-center justify-between gap-4 border-b border-border py-4"
              >
                <span className="inline-flex items-center gap-3 text-sm text-fg">
                  <Icon className="h-4 w-4 text-muted" aria-hidden />
                  {c.label}
                </span>
                {c.href ? (
                  <a
                    href={c.href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="min-w-0 break-words text-right text-sm text-fg underline decoration-border underline-offset-4 transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {c.sub}
                  </a>
                ) : (
                  <span className="text-sm text-muted">{c.sub}</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
