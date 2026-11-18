import { createFileRoute } from "@tanstack/react-router";
import SystemPreview from "@/components/profile/preview/SystemPreview";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";

/**
 * /preview/system: every profile token, type style and primitive in both
 * themes (profile redesign, Phase 0), for review and the visual baselines.
 */
const metadata: Metadata = {
  title: "Design system preview",
  robots: { index: false, follow: false },
};

export const Route = createFileRoute("/preview/system")({
  head: () => pageHead(metadata),
  component: SystemPreview,
});
