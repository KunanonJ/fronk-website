import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { PortableText } from "@/components/PortableText";
import { AboutFallback } from "@/components/content/AboutFallback";
import { FAQ } from "@/components/FAQ";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { resolveSiteSettings } from "@/lib/content/siteSettings";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { buildFaqJsonLd, buildProfilePageJsonLd } from "@/lib/seo/jsonLd";
import { fetchSiteSettings, fetchStandardPage } from "@/lib/sanity/fetch";

export const revalidate = 60;

const SERVICES = [
  {
    n: "01",
    title: "Product & fintech",
    body: "Ship customer-facing products and the payments plumbing underneath.",
  },
  {
    n: "02",
    title: "AI workspaces",
    body: "Practical AI tools for solo founders — not demos, production workflows.",
  },
  {
    n: "03",
    title: "Founder ops",
    body: "Turn messy operations into software that compounds.",
  },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStandardPage("about");
  const page = resolveStandardPage("about", cms);
  return {
    title: page.metadata.title,
    description: page.metadata.description,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const { isEnabled: preview } = await draftMode();
  const [cms, settingsCms] = await Promise.all([
    fetchStandardPage("about", { preview }),
    fetchSiteSettings({ preview }),
  ]);
  const page = resolveStandardPage("about", cms);
  const site = resolveSiteSettings(settingsCms);

  return (
    <Container size="lg" className="py-16 sm:py-24 lg:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProfilePageJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(FAQ_ITEMS)),
        }}
      />

      <div className="mb-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
            {page.heading}
          </h1>
        </div>
        <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl border border-border bg-surface lg:mx-0 lg:h-[220px] lg:w-[220px]">
          <Image
            src="/profile.jpg"
            alt={`${site.name} — headshot`}
            width={440}
            height={440}
            priority
            sizes="220px"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {cms?.body && cms.body.length > 0 ? (
        <Prose>
          <PortableText value={cms.body} />
        </Prose>
      ) : (
        <AboutFallback />
      )}

      <section className="mt-20" aria-labelledby="services-heading">
        <h2
          id="services-heading"
          className="text-xs uppercase tracking-[0.2em] text-muted"
        >
          Services
        </h2>
        <ul className="mt-8 divide-y divide-border border-y border-border">
          {SERVICES.map((service) => (
            <li
              key={service.n}
              className="grid gap-3 py-8 sm:grid-cols-[4rem_minmax(0,1fr)]"
            >
              <span className="text-sm text-muted">{service.n}</span>
              <div>
                <h3 className="font-display text-2xl font-semibold text-fg">
                  {service.title}
                </h3>
                <p className="mt-2 max-w-xl text-muted">{service.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16 border-t border-border pt-12">
        <FAQ items={FAQ_ITEMS} />
      </div>
    </Container>
  );
}
