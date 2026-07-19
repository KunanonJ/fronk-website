import type { Metadata } from "next";
import BlogIndex from "@/components/landing/BlogIndex";
import { resolveBlogCards } from "@/lib/content/blog";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import { fetchAllPosts, fetchWritingPage } from "@/lib/sanity/fetch";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await fetchWritingPage();
  const page = resolveWritingPageContent(cmsPage);
  return routeShareMeta({
    title: page.metadata.title,
    description: page.metadata.description,
    path: "/blog",
  });
}

export default async function BlogRoute() {
  const [posts, cmsPage] = await Promise.all([
    fetchAllPosts(),
    fetchWritingPage(),
  ]);
  const page = resolveWritingPageContent(cmsPage);
  const cards = resolveBlogCards(posts);

  return (
    <BlogIndex
      posts={cards}
      eyebrow={page.eyebrow}
      heading={page.heading}
      description={page.description}
    />
  );
}
