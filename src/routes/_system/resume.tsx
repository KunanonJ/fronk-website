import { createFileRoute } from "@tanstack/react-router";
import { metadata } from "@/app/(system)/resume/page";
import { ResumeView } from "@/components/resume/ResumeView";
import { pageHead } from "@/src/lib/head";
import { getResumeProfile } from "@/src/server/content.functions";

export const Route = createFileRoute("/_system/resume")({
  loader: () => getResumeProfile(),
  head: () => pageHead(metadata),
  component: ResumeRoute,
});

function ResumeRoute() {
  return <ResumeView profile={Route.useLoaderData()} />;
}
