import { createFileRoute } from "@tanstack/react-router";
import DesignSystemPage from "@/components/system/DesignSystemPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

/**
 * Design-system review page (visual-redesign Phase 0; restyled for the bento
 * system in phase 7g). Unlinked, noindex, and kept out of sitemap.xml and
 * llms.txt; used for screenshot review of the tokens and components in both
 * themes.
 */
const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

export const Route = createFileRoute("/_system/design")({
  head: () => pageHead(metadata),
  component: DesignSystemPage,
});
