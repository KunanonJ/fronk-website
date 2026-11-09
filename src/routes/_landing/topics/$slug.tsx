import { createFileRoute, notFound } from "@tanstack/react-router";
import { TopicPillarPageView, generateMetadata } from "@/app/(landing)/topics/[slug]/page";
import { getTopicPillar, isTopicSlug } from "@/lib/content/topics/pillars";
import { pageHead } from "@/src/lib/head";
import { fileOg } from "@/src/lib/og";

export const Route = createFileRoute("/_landing/topics/$slug")({
  loader: async ({ params }) => {
    if (!(isTopicSlug(params.slug) && getTopicPillar(params.slug, "en"))) throw notFound();
    return { head: pageHead(await generateMetadata({ params: Promise.resolve(params) }), { fileOgImage: fileOg(`/topics/${params.slug}`, "Topic hub") }) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <TopicPillarPageView slug={slug} />;
}
