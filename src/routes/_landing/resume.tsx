import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Metadata } from "@/lib/seo/types";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import ResumePage from "@/components/resume/ResumePage";
import { ResumePrint } from "@/components/resume/ResumePrint";
import { RESUME_META } from "@/lib/resume/search";
import { routeCacheHeaders } from "@/src/lib/cache";
import { pageHead } from "@/src/lib/head";
import { loadResume, resumeQuery } from "@/src/queries/content";
import { routeShareMeta } from "@/lib/seo/routeMeta";

// The share tags are the page's own, so a résumé link pasted into a chat
// previews as the résumé and not as the homepage. It stays out of search.
const metadata: Metadata = {
  ...routeShareMeta({
    title: RESUME_META.title,
    description: RESUME_META.description,
    path: RESUME_META.path,
  }),
  robots: { index: false, follow: false },
};

/**
 * /resume ("Snapshot", now-building program phase 2): in the site layout,
 * with the header and footer. ResumePage is the screen; the printed résumé
 * (`pnpm pdf`) is ResumePrint, plain and unchanged by it.
 */
export const Route = createFileRoute("/_landing/resume")({
  loader: ({ context }) => loadResume(context.queryClient),
  head: () => pageHead(metadata),
  // A résumé drawn from the repo because Sanity could not be read is not
  // kept at the edge: the next visit reads Sanity again.
  headers: ({ match, loaderData }) =>
    routeCacheHeaders(match, ["resume"], !loaderData?.degraded),
  component: ResumeRoute,
});

function ResumeRoute() {
  const profile = useSuspenseQuery(resumeQuery).data;

  return (
    <ProfileMain>
      <ResumePage profile={profile} />
      {/* Marked when the repo's résumé stands in for a failed Sanity read:
          `pnpm pdf` refuses to print a stand-in as the résumé. */}
      <div
        className="hidden print:block"
        data-resume-stand-in={profile.degraded ? "" : undefined}
      >
        <ResumePrint profile={profile} />
      </div>
    </ProfileMain>
  );
}
