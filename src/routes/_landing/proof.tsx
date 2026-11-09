import { createFileRoute } from "@tanstack/react-router";
import ProofPage from "@/components/landing/ProofPage";
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
  return <ProofPage />;
}

export const Route = createFileRoute("/_landing/proof")({
  head: () => pageHead(metadata),
  component: ProofRoute,
});
