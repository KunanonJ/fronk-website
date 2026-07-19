import type { Metadata } from "next";
import StackPage from "@/components/landing/StackPage";
import { stackPage } from "@/lib/content/stack";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Stack",
  description: stackPage.description,
  path: "/stack",
});

export default function StackRoute() {
  return <StackPage />;
}
