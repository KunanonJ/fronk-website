import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { VentureCaseRow } from "@/components/home/VentureCaseRow";
import { PageHeader } from "@/components/layout/PageHeader";
import { resolveStandardPage } from "@/lib/content/standardPage";
import { getAllVentures, resolveVentures } from "@/lib/content/ventures";
import { fetchAllVentures, fetchStandardPage } from "@/lib/sanity/fetch";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStandardPage("ventures");
  const page = resolveStandardPage("ventures", cms);
  return {
    title: page.metadata.title,
    description: page.metadata.description,
  };
}

export default async function VenturesPage() {
  const { isEnabled: preview } = await draftMode();
  const [cmsPage, cmsVentures] = await Promise.all([
    fetchStandardPage("ventures", { preview }),
    fetchAllVentures({ preview }),
  ]);
  const page = resolveStandardPage("ventures", cmsPage);
  const ventures = resolveVentures(cmsVentures, getAllVentures());

  return (
    <Container size="xl" className="py-20">
      <PageHeader
        eyebrow={page.eyebrow}
        title={page.heading}
        description={page.description}
      />

      <div className="space-y-20 sm:space-y-28">
        {ventures.map((venture, i) => (
          <VentureCaseRow key={venture.slug} venture={venture} index={i} />
        ))}
      </div>
    </Container>
  );
}
