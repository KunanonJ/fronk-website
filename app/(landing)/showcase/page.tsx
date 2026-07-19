import type { Metadata } from "next";
import ShowcasePage from "@/components/landing/ShowcasePage";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Showcase",
  description:
    "Creative studio showcase — liquid-glass product moments from KunanonJ.",
  path: "/showcase",
});

export default function ShowcaseRoute() {
  return <ShowcasePage />;
}
