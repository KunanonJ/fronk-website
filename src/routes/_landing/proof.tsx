import { createFileRoute } from "@tanstack/react-router";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import ProofPage from "@/components/profile/pages/library/ProofPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.proof.title,
  description: PAGE_META.proof.description,
  path: "/proof",
});

function ProofRoute() {
  return (
    <ProfileMain>
      <ProofPage />
    </ProfileMain>
  );
}

/**
 * /proof (profile redesign, Phase 7 lane D1). No URL state: the
 * metric tiles pick a quote locally (owner default 09-11-26).
 */
export const Route = createFileRoute("/_landing/proof")({
  head: () => pageHead(metadata),
  component: ProofRoute,
});
