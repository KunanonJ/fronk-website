import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/app/(system)/resume/page";
import { ResumeView } from "@/components/resume/ResumeView";
import { edgeCacheHeaders } from "@/src/lib/cache";
import { pageHead } from "@/src/lib/head";
import { resumeQuery } from "@/src/queries/content";

export const Route = createFileRoute("/_system/resume")({
  loader: ({ context }) => context.queryClient.ensureQueryData(resumeQuery),
  head: () => pageHead(metadata),
  headers: () => edgeCacheHeaders(["resume"]),
  component: ResumeRoute,
});

function ResumeRoute() {
  return <ResumeView profile={useSuspenseQuery(resumeQuery).data} />;
}
