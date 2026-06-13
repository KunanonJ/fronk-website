import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { PortableText } from "@/components/PortableText";
import { NowFallback } from "@/components/content/NowFallback";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { fetchStandardPage } from "@/lib/sanity/fetch";
import { formatDate } from "@/lib/utils/formatDate";

export const revalidate = 60;

const DEFAULT_LAST_UPDATED = "2026-05-14";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStandardPage("now");
  const page = resolveStandardPage("now", cms);
  return {
    title: page.metadata.title,
    description: page.metadata.description,
  };
}

export default async function NowPage() {
  const { isEnabled: preview } = await draftMode();
  const cms = await fetchStandardPage("now", { preview });
  const page = resolveStandardPage("now", cms);
  const lastUpdated = page.lastUpdated ?? DEFAULT_LAST_UPDATED;

  return (
    <Container size="lg" className="py-20">
      <header className="mb-12">
        <p className="text-sm uppercase tracking-widest text-muted">
          {page.eyebrow}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {page.heading}
        </h1>
        <p className="mt-4 text-sm text-muted">
          Last updated {formatDate(lastUpdated)}.
        </p>
      </header>

      {cms?.body && cms.body.length > 0 ? (
        <Prose>
          <PortableText value={cms.body} />
        </Prose>
      ) : (
        <NowFallback />
      )}
    </Container>
  );
}
