import { createFileRoute, notFound } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import SkillDetailPage from "@/components/landing/skills/SkillDetailPage";
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

/** The page body for one slug; shared with the TanStack Start route. */
function SkillRouteView({ slug }: { slug: string }) {
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
      <SkillDetailPage skill={skill} />
    </ProfileMain>
  );
}

export const Route = createFileRoute("/_landing/skills/$slug")({
  loader: ({ params }) => {
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
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <SkillRouteView slug={slug} />;
}
