import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../../lib/head";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import IntroLoader from "@/components/landing/IntroLoader";
import PortfolioStrip from "@/components/landing/home/PortfolioStrip";
import ProofStrip from "@/components/landing/home/ProofStrip";
import type { Metadata } from "@/lib/seo/types";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { site } from "@/lib/content/landing";

const metadata: Metadata = {
  ...routeShareMeta({
    title: site.title,
    description: site.description,
    path: "/",
  }),
  title: { absolute: site.title },
};

function HomePage() {
  return (
    <main id="main" className="min-h-[100svh] overflow-x-hidden bg-page">
      <IntroLoader />
      <Hero />
      <Features />
      <ProofStrip />
      <PortfolioStrip />
      <About />
    </main>
  );
}

export const Route = createFileRoute("/_landing/")({
  head: () => pageHead(metadata),
  component: HomePage,
});
