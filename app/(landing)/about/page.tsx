import type { Metadata } from "next";
import AboutPageContent from "@/components/landing/AboutPageContent";
import AboutHero from "@/components/landing/about/AboutHero";
import { aboutPage } from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";
import {
  buildFaqJsonLd,
  buildProfilePageJsonLd,
} from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = {
  ...routeShareMeta({
    title: aboutPage.meta.title,
    description: aboutPage.meta.description,
    path: "/about",
  }),
  // Already contains the name, so skip the "— Fronk Kunanon Jarat" suffix.
  title: { absolute: aboutPage.meta.title },
};

export default function AboutPage() {
  const profileLd = JSON.stringify(buildProfilePageJsonLd());
  const faqLd = JSON.stringify(buildFaqJsonLd(FAQ_ITEMS));

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
