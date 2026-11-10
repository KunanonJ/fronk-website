import { createFileRoute } from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import ProofPage from "@/components/landing/library/ProofPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";
import { proofPage } from "@/lib/content/proof";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: "Proof",
  description: proofPage.description,
  path: "/proof",
});

function ProofRoute() {
  return (
    <PageMain>
      <ProofPage />
    </PageMain>
  );
}

/**
 * /proof (bento redesign, phase 7f; design spec 4.13). No URL state: the
 * metric tiles pick a quote locally (owner default 09-11-26).
 */
export const Route = createFileRoute("/_landing/proof")({
  head: () => pageHead(metadata),
  component: ProofRoute,
});
