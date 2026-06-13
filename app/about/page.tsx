import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { PortableText } from "@/components/PortableText";
import { AboutFallback } from "@/components/content/AboutFallback";
import { FAQ } from "@/components/FAQ";
import { PageHeader } from "@/components/layout/PageHeader";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { resolveSiteSettings } from "@/lib/content/siteSettings";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { buildFaqJsonLd, buildProfilePageJsonLd } from "@/lib/seo/jsonLd";
import { fetchSiteSettings, fetchStandardPage } from "@/lib/sanity/fetch";

export const revalidate = 60;

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
      {/* ProfilePage schema bound to the site graph's Person (developer-controlled). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProfilePageJsonLd()),
        }}
      />
      {/* FAQPage schema — mirrors the visible FAQ below (same FAQ_ITEMS source). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(FAQ_ITEMS)),
        }}
      />
      <div className="mb-16 flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="relative hidden h-28 w-28 flex-shrink-0 overflow-hidden border border-border bg-surface sm:block">
          <Image
            src="/profile.jpg"
            alt={`${site.name} — headshot`}
            width={400}
            height={400}
            priority
            loading="eager"
            sizes="112px"
            className="h-full w-full object-cover"
          />
        </div>
        <PageHeader eyebrow={page.eyebrow} title={page.heading} className="mb-0" />
      </div>

      {cms?.body && cms.body.length > 0 ? (
        <Prose>
          <PortableText value={cms.body} />
        </Prose>
      ) : (
        <AboutFallback />
      )}

      <div className="rule-hud mt-16 pt-12">
        <FAQ items={FAQ_ITEMS} />
      </div>
    </Container>
  );
}
