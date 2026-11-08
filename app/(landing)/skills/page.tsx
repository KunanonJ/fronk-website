import type { Metadata } from "next";
import SkillsIndexPage from "@/components/landing/skills/SkillsIndexPage";
import { skillsPage } from "@/lib/content/skills";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Skills",
  description: skillsPage.metaDescription,
  path: "/skills",
});

export default function SkillsRoute() {
  const crumbLd = JSON.stringify(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Skills", path: "/skills" },
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <SkillsIndexPage />
    </>
  );
}
