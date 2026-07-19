import type { Metadata } from "next";
import ProofPage from "@/components/landing/ProofPage";
import { proofPage } from "@/lib/content/proof";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Proof",
  description: proofPage.description,
  path: "/proof",
});

export default function ProofRoute() {
  return <ProofPage />;
}
