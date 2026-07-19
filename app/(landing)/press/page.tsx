import type { Metadata } from "next";
import PressPage from "@/components/landing/PressPage";
import { pressPage } from "@/lib/content/press";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Press",
  description: pressPage.description,
  path: "/press",
});

export default function PressRoute() {
  return <PressPage />;
}
