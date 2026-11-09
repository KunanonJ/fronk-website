import { createFileRoute, notFound } from "@tanstack/react-router";
import { SkillRouteView, generateMetadata } from "@/app/(landing)/skills/[slug]/page";
import { getSkillBySlug } from "@/lib/content/skills";
import { pageHead } from "@/src/lib/head";
import { fileOg } from "@/src/lib/og";

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
