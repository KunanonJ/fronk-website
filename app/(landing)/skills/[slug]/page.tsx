import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SkillDetailPage from "@/components/landing/skills/SkillDetailPage";
import {
  getAllSkillSlugs,
  getSkillBySlug,
  skillMetaDescription,
  skillTitle,
} from "@/lib/content/skills";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { buildSkillJsonLd } from "@/lib/seo/skillsJsonLd";

type Props = { params: Promise<{ slug: string }> };

/** Only the snapshot's skills exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSkillSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) return { title: "Skills" };

  return routeShareMeta({
    title: skillTitle(skill),
    description: skillMetaDescription(skill),
    path: `/skills/${slug}`,
    hasOwnOgImage: true,
  });
}

export default async function SkillRoute({ params }: Props) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);
  if (!skill) notFound();

  const crumbLd = JSON.stringify(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Skills", path: "/skills" },
      { name: skill.name, path: `/skills/${slug}` },
    ]),
  );
  const codeLd = JSON.stringify(buildSkillJsonLd(skill));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: codeLd }}
      />
      <SkillDetailPage skill={skill} />
    </>
  );
}
