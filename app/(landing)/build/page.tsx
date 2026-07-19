import type { Metadata } from "next";
import BuildPage from "@/components/landing/BuildPage";
import { buildPage } from "@/lib/content/buildBoard";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Build",
  description: buildPage.description,
  path: "/build",
});

export default function BuildRoute() {
  return <BuildPage />;
}
