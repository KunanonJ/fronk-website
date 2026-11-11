import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { Metadata } from "@/lib/seo/types";
import { PageMain } from "@/components/bento/Bento";
import ResumePage from "@/components/resume/ResumePage";
import { ResumePrint } from "@/components/resume/ResumePrint";
import {
  RESUME_META,
  RESUME_SEARCH_DEFAULTS,
  resumeSearchSchema,
  type ResumeDetail,
} from "@/lib/resume/search";
import { routeCacheHeaders } from "@/src/lib/cache";
import { FILTER_NAVIGATION } from "@/src/lib/filterParam";
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
 * /resume (bento redesign, phase 7b): in the site layout since 7b, with the
 * header, footer and Share. `?view=compact` (typed, Valibot) hides the
 * bullet lists on screen; the default, detailed, never shows in the URL.
 * The printed résumé (`pnpm pdf`) is ResumePrint, unchanged by either.
 */
export const Route = createFileRoute("/_landing/resume")({
  validateSearch: resumeSearchSchema,
  search: { middlewares: [stripSearchParams(RESUME_SEARCH_DEFAULTS)] },
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
  const { view } = Route.useSearch();
  const navigate = Route.useNavigate();
  const setView = (next: ResumeDetail) => {
    void navigate({
      search: (prev) => ({ ...prev, view: next }),
      ...FILTER_NAVIGATION,
    });
  };

  return (
    <PageMain>
      <ResumePage profile={profile} detail={view} onDetailChange={setView} />
      {/* Marked when the repo's résumé stands in for a failed Sanity read:
          `pnpm pdf` refuses to print a stand-in as the résumé. */}
      <div
        className="hidden print:block"
        data-resume-stand-in={profile.degraded ? "" : undefined}
      >
        <ResumePrint profile={profile} />
      </div>
    </PageMain>
  );
}
