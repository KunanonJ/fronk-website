import { createFileRoute, notFound } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import SkillDetailPage from "@/components/landing/skills/SkillDetailPage";
import { loadSkillMd } from "@/lib/content/skillMd";
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

/** One skill's page: its breadcrumb and skill JSON-LD, then the skill. */
function SkillRoute() {
  const { slug } = Route.useParams();
  const { skillMd } = Route.useLoaderData();
  const skill = getSkillBySlug(slug);
  if (!skill) throw notFound();

  return (
    <ProfileMain>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Skills", path: "/skills" },
          { name: skill.name, path: `/skills/${slug}` },
        ])}
      />
      <JsonLd data={buildSkillJsonLd(skill)} />
      <SkillDetailPage skill={skill} skillMd={skillMd} />
    </ProfileMain>
  );
}

export const Route = createFileRoute("/_landing/skills/$slug")({
  loader: async ({ params }) => {
    const skill = getSkillBySlug(params.slug);
    if (!skill) throw notFound();
    return {
      head: pageHead(
        routeShareMeta({
          title: skillTitle(skill),
          description: skillMetaDescription(skill),
          path: `/skills/${params.slug}`,
          hasOwnOgImage: true,
        }),
        { fileOgImage: fileOg(`/skills/${params.slug}`, "Agent skill") },
      ),
      // This skill's SKILL.md only (lib/content/skillMd.ts): read at build
      // time for the prerendered page, fetched as its own chunk on a
      // client-side navigation.
      skillMd: await loadSkillMd(skill.slug),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SkillRoute,
});
