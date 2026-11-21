import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/JsonLd";
import OpenSourcePage from "@/components/profile/pages/library/OpenSourcePage";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import {
  OPEN_SOURCE_PROJECTS,
  OPEN_SOURCE_SYNCED_ON,
} from "@/lib/content/openSource";
import { PAGE_META } from "@/lib/content/pageMeta";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildOpenSourceJsonLd } from "@/lib/seo/openSourceJsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

// The site's share card (no own OG image, like /stack and /skills), and the
// Markdown twin advertised as rel="alternate".
const metadata: Metadata = routeShareMeta({
  title: PAGE_META["open-source"].title,
  description: PAGE_META["open-source"].description,
  path: "/open-source",
  markdownPath: "/open-source.md",
});

function OpenSourceRoute() {
  return (
    <ProfileMain>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Open source", path: "/open-source" },
        ])}
      />
      <JsonLd
        data={buildOpenSourceJsonLd(
          OPEN_SOURCE_PROJECTS,
          OPEN_SOURCE_SYNCED_ON,
        )}
      />
      <OpenSourcePage />
    </ProfileMain>
  );
}

/**
 * /open-source (21-11-26): the owner's open-source projects from the GitHub
 * snapshot. No URL state. head() reads only PAGE_META, so the snapshot stays
 * out of the entry chunk. Prerendered: Home's strip links it.
 */
export const Route = createFileRoute("/_landing/open-source")({
  head: () => pageHead(metadata),
  component: OpenSourceRoute,
});
