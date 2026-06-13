import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { PortableText } from "@/components/PortableText";
import { AboutFallback } from "@/components/content/AboutFallback";
import { resolveSiteSettings } from "@/lib/content/siteSettings";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { fetchSiteSettings, fetchStandardPage } from "@/lib/sanity/fetch";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStandardPage("about");
  const page = resolveStandardPage("about", cms);
  return {
    title: page.metadata.title,
    description: page.metadata.description,
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
    <Container size="lg" className="py-20">
      <header className="mb-12 flex items-end gap-6">
        <div className="relative hidden h-24 w-24 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-border sm:block">
          <Image
            src="/profile.jpg"
            alt={`${site.name} — headshot`}
            width={400}
            height={400}
            priority
            loading="eager"
            sizes="96px"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-widest text-muted">
            {page.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {page.heading}
          </h1>
        </div>
      </header>

      {cms?.body && cms.body.length > 0 ? (
        <Prose>
          <PortableText value={cms.body} />
        </Prose>
      ) : (
        <AboutFallback />
      )}
    </Container>
  );
}
