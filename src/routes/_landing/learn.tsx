import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import LearnPage from "@/components/landing/LearnPage";
import type { Metadata } from "@/lib/seo/types";
import { edgeCacheHeaders } from "@/src/lib/cache";
import { learnCardsQuery } from "@/src/queries/content";
import { learnPage } from "@/lib/content/learn";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Learn",
  description: learnPage.description,
  path: "/learn",
});


export const Route = createFileRoute("/_landing/learn")({
  loader: ({ context }) => context.queryClient.ensureQueryData(learnCardsQuery),
  head: () => pageHead(metadata),
  headers: () => edgeCacheHeaders(["posts"]),
  component: LearnRoute,
});

function LearnRoute() {
  return <LearnPage posts={useSuspenseQuery(learnCardsQuery).data} />;
}
