import { createFileRoute } from "@tanstack/react-router";
import {
  TopicHubView,
  topicHub,
} from "@/components/profile/pages/TopicHubPage";
import { topicHreflang, topicPath } from "@/lib/content/topics/pillars";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

/**
 * A Thai topic hub: the English hub's view in Thai, with og:locale th_TH and
 * the site's default share card in its head.
 */
export const Route = createFileRoute("/_landing/th/topics/$slug")({
  loader: ({ params }) => {
    const { slug, pillar } = topicHub(params.slug, "th");
    return {
      head: pageHead(
        routeShareMeta({
          title: pillar.title,
          description: pillar.description,
          path: topicPath(slug, "th"),
          languages: topicHreflang(slug),
          locale: "th_TH",
        }),
      ),
    };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: ThaiTopicRoute,
});

function ThaiTopicRoute() {
  const { slug } = Route.useParams();
  return <TopicHubView {...topicHub(slug, "th")} />;
}
