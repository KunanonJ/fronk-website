import { createFileRoute } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { pageHead } from "../../lib/head";
import { PageMain } from "@/components/bento/Bento";
import AboutHero from "@/components/landing/about/AboutHero";
import AboutPageContent from "@/components/landing/AboutPageContent";
import type { Metadata } from "@/lib/seo/types";
import { buildFaqJsonLd, buildProfilePageJsonLd } from "@/lib/seo/jsonLd";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { aboutPage } from "@/lib/content/aboutPage";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { fileOg } from "@/src/lib/og";

const metadata: Metadata = {
  ...routeShareMeta({
    title: aboutPage.meta.title,
    description: aboutPage.meta.description,
    path: "/about",
    hasOwnOgImage: true,
  }),
  // Already contains the name, so skip the "— Fronk Kunanon Jarat" suffix.
  title: { absolute: aboutPage.meta.title },
};

/**
 * About (bento redesign, phase 7b; design spec 4.2): the hero beside the
 * portrait, then one dense bento. The JSON-LD scripts render nothing, so
 * they add no gap to the column.
 */
function AboutPage() {
  const profileLd = serializeJsonLd(buildProfilePageJsonLd());
  const faqLd = serializeJsonLd(buildFaqJsonLd(FAQ_ITEMS));

  return (
    <PageMain>
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
    </PageMain>
  );
}

export const Route = createFileRoute("/_landing/about")({
  head: () =>
    pageHead(metadata, {
      fileOgImage: fileOg(
        "/about",
        "Kunanon Jarat: AI Engineering Lead in Bangkok",
      ),
    }),
  component: AboutPage,
});
