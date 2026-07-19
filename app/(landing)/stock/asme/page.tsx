import type { Metadata } from "next";
import AsmeCuriousHero from "@/components/landing/stock/AsmeCuriousHero";

export const metadata: Metadata = {
  title: "Stock — Asme / Built for the curious",
  description:
    "Design-stock liquid-glass hero (Asme). Not part of the public site IA.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/stock/asme" },
};

export default function AsmeStockPage() {
  return <AsmeCuriousHero />;
}
