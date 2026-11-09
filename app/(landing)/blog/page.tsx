import type { Metadata } from "next";
import BlogIndex from "@/components/landing/BlogIndex";
import { resolveBlogCards } from "@/lib/content/blog";
import { BLOG_PUBLIC, HIDDEN_BLOG_ROBOTS } from "@/lib/content/blogVisibility";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import { fetchAllPosts, fetchWritingPage } from "@/lib/sanity/fetch";
import { routeShareMeta } from "@/lib/seo/routeMeta";

/**
 * Sanity-backed, so re-render at most every 60 s (via the OpenNext queue).
 * Sanity is only configured at runtime (wrangler vars), so the build
 * prerenders fallback content; without a revalidate time this page would
 * stay on that build output forever and never pick up Sanity edits.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await fetchWritingPage();
  const page = resolveWritingPageContent(cmsPage);
  return {
    ...routeShareMeta({
      title: page.metadata.title,
      description: page.metadata.description,
      path: "/blog",
    }),
    // Hidden 09-11-26: reachable by URL but kept out of search (BLOG_PUBLIC).
    ...(BLOG_PUBLIC ? {} : { robots: HIDDEN_BLOG_ROBOTS }),
  };
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
