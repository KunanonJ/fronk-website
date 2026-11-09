import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/app/(landing)/learn/page";
import LearnPage from "@/components/landing/LearnPage";
import { edgeCacheHeaders } from "@/src/lib/cache";
import { pageHead } from "@/src/lib/head";
import { learnCardsQuery } from "@/src/queries/content";

export const Route = createFileRoute("/_landing/learn")({
  loader: ({ context }) => context.queryClient.ensureQueryData(learnCardsQuery),
  head: () => pageHead(metadata),
  headers: () => edgeCacheHeaders(["posts"]),
  component: LearnRoute,
});

function LearnRoute() {
  return <LearnPage posts={useSuspenseQuery(learnCardsQuery).data} />;
}
