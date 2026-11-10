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
import { resumeQuery } from "@/src/queries/content";

const metadata: Metadata = {
  title: RESUME_META.title,
  description: RESUME_META.description,
  alternates: { canonical: RESUME_META.path },
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
  loader: ({ context }) => context.queryClient.ensureQueryData(resumeQuery),
  head: () => pageHead(metadata),
  headers: ({ match }) => routeCacheHeaders(match, ["resume"]),
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
      <div className="hidden print:block">
        <ResumePrint profile={profile} />
      </div>
    </PageMain>
  );
}
