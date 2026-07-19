import type { Metadata } from "next";
import AsmeCuriousHero from "@/components/landing/stock/AsmeCuriousHero";
import { site } from "@/lib/content/landing";

export const metadata: Metadata = {
  title: "About",
  description:
    "Built for the curious — Kunanon Jarat (Fronk), Bangkok founder of GoGoCash, Manut, and Airplusauto.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: `About — ${site.wordmark}`,
    description:
      "Kunanon Jarat (Fronk) — building fintech and AI workspaces from Bangkok.",
  },
};

export default function AboutPage() {
  return <AsmeCuriousHero />;
}
