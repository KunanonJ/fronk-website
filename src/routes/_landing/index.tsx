import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../../lib/head";
import { Bento, PageMain } from "@/components/bento/Bento";
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
 * Home (bento redesign, phase 7a; reweighted in recruiter-fit phase 2): the
 * hero, then one dense bento that leads with the evidence:
 * Selected work (2) | Experience / Ventures | How I work (2) / Bangkok (3).
 * The Bangkok card closes the page, as it does on Contact.
 */
function HomePage() {
  return (
    <PageMain>
      <IntroLoader />
      <HomeHero />
      <Bento dense>
        <SelectedWorkCard />
        <ExperienceCard />
        <VenturesCard />
        <HowIWorkCard />
        <PlaceCard span={3} />
      </Bento>
    </PageMain>
  );
}

export const Route = createFileRoute("/_landing/")({
  head: () => pageHead(metadata),
  component: HomePage,
});
