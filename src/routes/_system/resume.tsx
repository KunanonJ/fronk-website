import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Metadata } from "@/lib/seo/types";
import { ResumeView } from "@/components/resume/ResumeView";
import { routeCacheHeaders } from "@/src/lib/cache";
import { pageHead } from "@/src/lib/head";
import { resumeQuery } from "@/src/queries/content";

const metadata: Metadata = {
  title: "Resume",
  description:
    "Kunanon Jarat (Fronk) — Founder, IT manager, AI engineering lead, and project leader across fintech, AI, and Web3.",
  alternates: { canonical: "/resume" },
  robots: { index: false, follow: false },
};


export const Route = createFileRoute("/_system/resume")({
  loader: ({ context }) => context.queryClient.ensureQueryData(resumeQuery),
  head: () => pageHead(metadata),
  headers: ({ match }) => routeCacheHeaders(match, ["resume"]),
  component: ResumeRoute,
});

function ResumeRoute() {
  return <ResumeView profile={useSuspenseQuery(resumeQuery).data} />;
}
