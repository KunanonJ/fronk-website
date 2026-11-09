import { createFileRoute } from "@tanstack/react-router";
import BuildPage from "@/components/landing/BuildPage";
import type { Metadata } from "@/lib/seo/types";
import { buildPage } from "@/lib/content/buildBoard";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Build",
  description: buildPage.description,
  path: "/build",
});

function BuildRoute() {
  return <BuildPage />;
}

export const Route = createFileRoute("/_landing/build")({
  head: () => pageHead(metadata),
  component: BuildRoute,
});
