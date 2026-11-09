import { createFileRoute } from "@tanstack/react-router";
import SkillsIndexPage from "@/components/landing/skills/SkillsIndexPage";
import type { Metadata } from "@/lib/seo/types";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { skillsPage } from "@/lib/content/skills";

const metadata: Metadata = routeShareMeta({
  title: "Skills",
  description: skillsPage.metaDescription,
  path: "/skills",
});

function SkillsRoute() {
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

export const Route = createFileRoute("/_landing/skills/")({
  head: () => pageHead(metadata),
  component: SkillsRoute,
});
