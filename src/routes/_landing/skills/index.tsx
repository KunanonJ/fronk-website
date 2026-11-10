import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import { PageMain } from "@/components/bento/Bento";
import SkillsIndexPage from "@/components/landing/skills/SkillsIndexPage";
import type { Metadata } from "@/lib/seo/types";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildSkillsPackJsonLd } from "@/lib/seo/skillsJsonLd";
import { FILTER_NAVIGATION, usePrerenderedParam } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import {
  SKILLS_SEARCH_DEFAULTS,
  skillsSearchSchema,
  type SkillFilter,
} from "@/lib/skills/search";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.skills.title,
  description: PAGE_META.skills.description,
  path: "/skills",
});

/**
 * /skills (bento redesign, phase 7d; design spec 4.8). The catalog filter is
 * the typed `?show=` param (Valibot): original, adapted, auto or user; the
 * default, all, never shows in the URL and an unknown value falls back to it.
 */
export const Route = createFileRoute("/_landing/skills/")({
  validateSearch: skillsSearchSchema,
  search: { middlewares: [stripSearchParams(SKILLS_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: SkillsRoute,
});

function SkillsRoute() {
  const show = usePrerenderedParam(
    Route.useSearch().show,
    SKILLS_SEARCH_DEFAULTS.show,
  );
  const navigate = Route.useNavigate();
  const setShow = (next: SkillFilter) => {
    void navigate({
      search: (prev) => ({ ...prev, show: next }),
      ...FILTER_NAVIGATION,
    });
  };

  const crumbLd = serializeJsonLd(
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Skills", path: "/skills" },
    ]),
  );
  const packLd = serializeJsonLd(buildSkillsPackJsonLd());

  return (
    <PageMain>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: crumbLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: packLd }}
      />
      <SkillsIndexPage show={show} onShowChange={setShow} />
    </PageMain>
  );
}
