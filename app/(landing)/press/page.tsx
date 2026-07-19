import type { Metadata } from "next";
import PressPage from "@/components/landing/PressPage";
import { pressPage } from "@/lib/content/press";

export const metadata: Metadata = {
  title: "Press",
  description: pressPage.description,
  alternates: { canonical: "/press" },
};

export default function PressRoute() {
  return <PressPage />;
}
