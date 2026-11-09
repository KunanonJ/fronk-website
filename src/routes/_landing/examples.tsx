import { createFileRoute } from "@tanstack/react-router";
import ExamplesPage from "@/components/landing/ExamplesPage";
import type { Metadata } from "@/lib/seo/types";
import { examplesPage } from "@/lib/content/examples";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Examples",
  description: examplesPage.description,
  path: "/examples",
});

function ExamplesRoute() {
  return <ExamplesPage />;
}

export const Route = createFileRoute("/_landing/examples")({
  head: () => pageHead(metadata),
  component: ExamplesRoute,
});
