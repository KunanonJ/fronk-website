import { createFileRoute, notFound } from "@tanstack/react-router";
import BlogPostView from "@/components/landing/BlogPostView";
import type { Post } from "@/lib/sanity/types";
import { getBlogPost } from "@/src/server/content.functions";

export const Route = createFileRoute("/_landing/blog/$slug")({
  loader: async ({ params }) => {
    const result = await getBlogPost({ data: params.slug });
    if (!result) throw notFound();
    return { post: result.postJson ? (JSON.parse(result.postJson) as Post) : null, head: result.head };
  },
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: BlogPostRoute,
});

function BlogPostRoute() {
  const { slug } = Route.useParams();
  const { post } = Route.useLoaderData();
  return <BlogPostView slug={slug} post={post} />;
}
