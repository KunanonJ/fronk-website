import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../../lib/head";
import { JsonLd } from "@/components/JsonLd";
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
  return (
    <ProfileMain reading>
      <JsonLd data={buildProfilePageJsonLd()} />
      <JsonLd data={buildFaqJsonLd(FAQ_ITEMS)} />
      <AboutPage />
    </ProfileMain>
  );
}

export const Route = createFileRoute("/_landing/about")({
  head: () =>
    pageHead(metadata, {
      // profileCardAlt(ABOUT_CARD); lib/og/profileCards.test.ts checks it.
      fileOgImage: fileOg(
        "/about",
        "Kunanon Jarat’s portrait beside “About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok.”",
      ),
    }),
  component: AboutRoute,
});
