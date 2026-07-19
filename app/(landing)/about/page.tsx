import type { Metadata } from "next";
import AboutPageContent from "@/components/landing/AboutPageContent";
import AsmeCuriousHero from "@/components/landing/stock/AsmeCuriousHero";
import { FAQ_ITEMS } from "@/lib/content/faq";
import {
  buildFaqJsonLd,
  buildProfilePageJsonLd,
} from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "About",
  description:
    "Kunanon Jarat (Fronk) — Bangkok founder of GoGoCash and Manut AI. Story, operating principles, and how to get in touch.",
  path: "/about",
});

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
      <AsmeCuriousHero />
      <AboutPageContent />
    </main>
  );
}
