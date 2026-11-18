import { createFileRoute } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { pageHead } from "../../lib/head";
import AboutPage from "@/components/profile/pages/AboutPage";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import type { Metadata } from "@/lib/seo/types";
import { buildFaqJsonLd, buildProfilePageJsonLd } from "@/lib/seo/jsonLd";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { fileOg } from "@/src/lib/og";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = {
  ...routeShareMeta({
    title: PAGE_META.about.title,
    description: PAGE_META.about.description,
    path: "/about",
    hasOwnOgImage: true,
    markdownPath: "/about.md",
  }),
  // Already contains the name, so skip the "— Fronk Kunanon Jarat" suffix.
  title: { absolute: PAGE_META.about.title },
};

/**
 * About (profile redesign, Phase 6 cutover; plan step 6d): the hero beside
 * the portrait, then the redesign's parts. The ProfilePage and FAQPage
 * JSON-LD are unchanged.
 */
function AboutRoute() {
  const profileLd = serializeJsonLd(buildProfilePageJsonLd());
  const faqLd = serializeJsonLd(buildFaqJsonLd(FAQ_ITEMS));

  return (
    <ProfileMain>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: profileLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqLd }}
      />
      <AboutPage />
    </ProfileMain>
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
  component: AboutRoute,
});
