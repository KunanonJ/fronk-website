import type { Metadata } from "next";
import ExamplesPage from "@/components/landing/ExamplesPage";
import { examplesPage } from "@/lib/content/examples";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Examples",
  description: examplesPage.description,
  path: "/examples",
});

export default function ExamplesRoute() {
  return <ExamplesPage />;
}
