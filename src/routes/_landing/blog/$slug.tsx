import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import BlogPostView from "@/components/landing/BlogPostView";
import type { Post } from "@/lib/sanity/types";
import { edgeCacheHeaders } from "@/src/lib/cache";
import { blogPostQuery } from "@/src/queries/content";

export const Route = createFileRoute("/_landing/blog/$slug")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(blogPostQuery(params.slug));
    if (!result) throw notFound();
    return { head: result.head };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  headers: () => edgeCacheHeaders(["posts"]),
  component: BlogPostRoute,
});

function BlogPostRoute() {
  const { slug } = Route.useParams();
  const result = useSuspenseQuery(blogPostQuery(slug)).data;
  const post = result?.postJson ? (JSON.parse(result.postJson) as Post) : null;
  return <BlogPostView slug={slug} post={post} />;
}
