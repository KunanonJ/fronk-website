import type { Metadata } from "next";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import IntroLoader from "@/components/landing/IntroLoader";
import { site } from "@/lib/content/landing";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = {
  ...routeShareMeta({
    title: site.title,
    description: site.description,
    path: "/",
  }),
  title: { absolute: site.title },
};

export default function HomePage() {
  return (
    <main id="main" className="min-h-[100svh] overflow-x-hidden bg-landing">
      <IntroLoader />
      <Hero />
      <About />
      <Features />
    </main>
  );
}
