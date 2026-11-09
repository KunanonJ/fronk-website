import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import BlogIndex from "@/components/landing/BlogIndex";
import { routeCacheHeaders } from "@/src/lib/cache";
import { blogIndexQuery } from "@/src/queries/content";

export const Route = createFileRoute("/_landing/blog/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(blogIndexQuery),
  head: ({ loaderData }) => loaderData?.head ?? {},
  headers: ({ match }) => routeCacheHeaders(match, ["posts", "writing"]),
  component: BlogRoute,
});

function BlogRoute() {
  const { cards, eyebrow, heading, description } =
    useSuspenseQuery(blogIndexQuery).data;
  return (
    <BlogIndex
      posts={cards}
      eyebrow={eyebrow}
      heading={heading}
      description={description}
    />
  );
}
