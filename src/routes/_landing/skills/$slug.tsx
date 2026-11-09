import { createFileRoute, notFound } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import SkillDetailPage from "@/components/landing/skills/SkillDetailPage";
import type { Metadata } from "@/lib/seo/types";
import {
  getSkillBySlug,
  skillMetaDescription,
  skillTitle,
} from "@/lib/content/skills";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildSkillJsonLd } from "@/lib/seo/skillsJsonLd";
import { fileOg } from "@/src/lib/og";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

async function generateMetadata({ params }: Props): Promise<Metadata> {
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

/** The page body for one slug; shared with the TanStack Start route. */
function SkillRouteView({ slug }: { slug: string }) {
  const skill = getSkillBySlug(slug);
  if (!skill) throw notFound();

  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Skills", path: "/skills" },
      { name: skill.name, path: `/skills/${slug}` },
    ]),
  );
  const codeLd = serializeJsonLd(buildSkillJsonLd(skill));

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

export const Route = createFileRoute("/_landing/skills/$slug")({
  loader: async ({ params }) => {
    if (!(getSkillBySlug(params.slug))) throw notFound();
    return { head: pageHead(await generateMetadata({ params: Promise.resolve(params) }), { fileOgImage: fileOg(`/skills/${params.slug}`, "Agent skill") }) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <SkillRouteView slug={slug} />;
}
