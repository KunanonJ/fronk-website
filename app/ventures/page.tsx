import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { WorkIndexList } from "@/components/work/WorkIndexList";
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
    alternates: { canonical: "/ventures" },
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
    <Container size="xl" className="py-14 sm:py-20 lg:py-24">
      <PageHeader
        eyebrow={page.eyebrow}
        title="Work"
        description={page.description}
      />
      <WorkIndexList ventures={ventures} />
    </Container>
  );
}
