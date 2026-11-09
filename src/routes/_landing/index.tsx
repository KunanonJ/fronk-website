import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../../lib/head";
import { Bento } from "@/components/bento/Bento";
import PlaceCard from "@/components/bento/PlaceCard";
import IntroLoader from "@/components/landing/IntroLoader";
import {
  ExperienceCard,
  HowIWorkCard,
  SelectedWorkCard,
  VenturesCard,
} from "@/components/landing/home/HomeCards";
import HomeHero from "@/components/landing/home/HomeHero";
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

/**
 * Home (bento redesign, phase 7a; design spec 4.1): the hero, then one dense
 * bento: Experience | Ventures | Selected work / Bangkok (2) | How I work.
 */
function HomePage() {
  return (
    <main
      id="main"
      className="kj mx-auto flex w-full max-w-[1000px] flex-col gap-14 px-6 pt-14 pb-14 max-[381px]:gap-11 max-[381px]:px-4"
    >
      <IntroLoader />
      <HomeHero />
      <Bento dense>
        <ExperienceCard />
        <VenturesCard />
        <SelectedWorkCard />
        <PlaceCard span={2} />
        <HowIWorkCard />
      </Bento>
    </main>
  );
}

export const Route = createFileRoute("/_landing/")({
  head: () => pageHead(metadata),
  component: HomePage,
});
