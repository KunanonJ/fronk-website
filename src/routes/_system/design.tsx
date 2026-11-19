import { createFileRoute } from "@tanstack/react-router";
import DesignSystemPage from "@/components/system/DesignSystemPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

/**
 * Design-system review page (visual-redesign Phase 0; the profile redesign's
 * tokens and primitives since its Phase 7g). Unlinked, noindex, and kept out
 * of sitemap.xml and llms.txt; used for screenshot review of the tokens and
 * components in both themes. Its canonical is its own address, not the
 * homepage's (backlog P3, fixed in Phase 7g).
 */
const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
  alternates: { canonical: "/design" },
};

export const Route = createFileRoute("/_system/design")({
  head: () => pageHead(metadata),
  component: DesignSystemPage,
});
