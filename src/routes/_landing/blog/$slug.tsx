import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import BlogPostView from "@/components/landing/blog/BlogPostView";
import type { Post } from "@/lib/sanity/types";
import { routeCacheHeaders } from "@/src/lib/cache";
import { blogPostQuery } from "@/src/queries/content";

export const Route = createFileRoute("/_landing/blog/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(
      blogPostQuery(params.slug),
    );
    if (!result) throw notFound();
    return { head: result.head };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  headers: ({ match }) => routeCacheHeaders(match, ["posts"]),
  component: BlogPostRoute,
});

/** One post (bento redesign, phase 7g; design spec 4.18). */
function BlogPostRoute() {
  const { slug } = Route.useParams();
  const result = useSuspenseQuery(blogPostQuery(slug)).data;
  const post = result?.postJson ? (JSON.parse(result.postJson) as Post) : null;
  return (
    <PageMain>
      <BlogPostView slug={slug} post={post} />
    </PageMain>
  );
}
