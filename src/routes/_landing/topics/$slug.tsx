import { createFileRoute } from "@tanstack/react-router";
import {
  TopicHubView,
  topicHub,
} from "@/components/profile/pages/TopicHubPage";
import { topicHreflang, topicPath } from "@/lib/content/topics/pillars";
import { fileOg } from "@/src/lib/og";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

/**
 * An English topic hub. The Thai route renders the same view; its head keeps
 * the site's default share card, where this one has its own.
 */
export const Route = createFileRoute("/_landing/topics/$slug")({
  loader: ({ params }) => {
    const { slug, pillar } = topicHub(params.slug, "en");
    return {
      head: pageHead(
        routeShareMeta({
          title: pillar.title,
          description: pillar.description,
          path: topicPath(slug, "en"),
          languages: topicHreflang(slug),
          hasOwnOgImage: true,
        }),
        { fileOgImage: fileOg(`/topics/${slug}`, "Topic hub") },
      ),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: TopicRoute,
});

function TopicRoute() {
  const { slug } = Route.useParams();
  return <TopicHubView {...topicHub(slug, "en")} />;
}
