import { createFileRoute } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { pageHead } from "../../lib/head";
import AboutHero from "@/components/landing/about/AboutHero";
import AboutPageContent from "@/components/landing/AboutPageContent";
import type { Metadata } from "@/lib/seo/types";
import { buildFaqJsonLd, buildProfilePageJsonLd } from "@/lib/seo/jsonLd";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { aboutPage } from "@/lib/content/aboutPage";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = {
  ...routeShareMeta({
    title: aboutPage.meta.title,
    description: aboutPage.meta.description,
    path: "/about",
  }),
  // Already contains the name, so skip the "— Fronk Kunanon Jarat" suffix.
  title: { absolute: aboutPage.meta.title },
};

function AboutPage() {
  const profileLd = serializeJsonLd(buildProfilePageJsonLd());
  const faqLd = serializeJsonLd(buildFaqJsonLd(FAQ_ITEMS));

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: profileLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqLd }}
      />
      <AboutHero />
      <AboutPageContent />
    </main>
  );
}

export const Route = createFileRoute("/_landing/about")({
  head: () => pageHead(metadata),
  component: AboutPage,
});
