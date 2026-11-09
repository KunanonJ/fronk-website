import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/app/(landing)/learn/page";
import LearnPage from "@/components/landing/LearnPage";
import { pageHead } from "@/src/lib/head";
import { getLearnCards } from "@/src/server/content.functions";

export const Route = createFileRoute("/_landing/learn")({
  loader: () => getLearnCards(),
  head: () => pageHead(metadata),
  component: LearnRoute,
});

function LearnRoute() {
  return <LearnPage posts={Route.useLoaderData()} />;
}
