import { createFileRoute } from "@tanstack/react-router";
import BlogIndex from "@/components/landing/BlogIndex";
import { getBlogIndex } from "@/src/server/content.functions";

export const Route = createFileRoute("/_landing/blog/")({
  loader: () => getBlogIndex(),
  head: ({ loaderData }) => loaderData?.head ?? {},
  component: BlogRoute,
});

function BlogRoute() {
  const { cards, eyebrow, heading, description } = Route.useLoaderData();
  return <BlogIndex posts={cards} eyebrow={eyebrow} heading={heading} description={description} />;
}
