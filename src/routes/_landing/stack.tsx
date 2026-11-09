import { createFileRoute } from "@tanstack/react-router";
import StackPage from "@/components/landing/StackPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { stackPage } from "@/lib/content/stack";

const metadata: Metadata = routeShareMeta({
  title: "Stack",
  description: stackPage.description,
  path: "/stack",
});

function StackRoute() {
  return <StackPage />;
}

export const Route = createFileRoute("/_landing/stack")({
  head: () => pageHead(metadata),
  component: StackRoute,
});
