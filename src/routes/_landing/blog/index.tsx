import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import BlogIndexPage from "@/components/landing/blog/BlogIndexPage";
import { BLOG_SEARCH_DEFAULTS, blogSearchSchema } from "@/lib/blog/search";
import { routeCacheHeaders } from "@/src/lib/cache";
import { blogIndexQuery } from "@/src/queries/content";

/**
 * /blog (bento redesign, phase 7g; design spec 4.17). Hidden while
 * BLOG_PUBLIC is false. The tag filter and the search are the typed `?tag=`
 * and `?q=` params (Valibot); empty values never show in the URL. The page
 * renders on request, so the server already applies them.
 */
export const Route = createFileRoute("/_landing/blog/")({
  validateSearch: blogSearchSchema,
  search: { middlewares: [stripSearchParams(BLOG_SEARCH_DEFAULTS)] },
  loader: ({ context }) => context.queryClient.ensureQueryData(blogIndexQuery),
  head: ({ loaderData }) => loaderData?.head ?? {},
  headers: ({ match }) => routeCacheHeaders(match, ["posts", "writing"]),
  component: BlogRoute,
});

function BlogRoute() {
  const { cards, eyebrow } = useSuspenseQuery(blogIndexQuery).data;
  const { tag, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const update = (next: { tag?: string; q?: string }) => {
    void navigate({
      search: (prev) => ({ ...prev, ...next }),
      replace: true,
      resetScroll: false,
      viewTransition: false,
    });
  };
  return (
    <PageMain>
      <BlogIndexPage
        posts={cards}
        eyebrow={eyebrow}
        tag={tag}
        query={q}
        onTagChange={(next) => update({ tag: next })}
        onQueryChange={(next) => update({ q: next })}
      />
    </PageMain>
  );
}
