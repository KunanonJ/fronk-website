import type { Metadata } from "next";
import ShowcasePage from "@/components/landing/ShowcasePage";
import { site } from "@/lib/content/landing";

export const metadata: Metadata = {
  title: "Showcase",
  description: site.description,
  alternates: { canonical: "/showcase" },
};

export default function ShowcaseRoute() {
  return <ShowcasePage />;
}
