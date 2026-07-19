import type { Metadata } from "next";
import VelorahDreamsHero from "@/components/landing/stock/VelorahDreamsHero";

export const metadata: Metadata = {
  title: "Stock — Velorah / Where dreams rise",
  description:
    "Design-stock cinematic liquid-glass hero (Velorah). Not part of the public site IA.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/stock/velorah" },
};

export default function VelorahStockPage() {
  return <VelorahDreamsHero />;
}
