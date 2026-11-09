import { createFileRoute, notFound } from "@tanstack/react-router";
import { ThaiTopicPillarPageView, generateMetadata } from "@/app/(landing)/th/topics/[slug]/page";
import { getTopicPillar, isTopicSlug } from "@/lib/content/topics/pillars";
import { pageHead } from "@/src/lib/head";

export const Route = createFileRoute("/_landing/th/topics/$slug")({
  loader: async ({ params }) => {
    if (!(isTopicSlug(params.slug) && getTopicPillar(params.slug, "th"))) throw notFound();
    return { head: pageHead(await generateMetadata({ params: Promise.resolve(params) })) };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  return <ThaiTopicPillarPageView slug={slug} />;
}
