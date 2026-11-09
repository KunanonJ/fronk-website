import type { Metadata } from "next";
import LearnPage from "@/components/landing/LearnPage";
import { resolveBlogCards } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { learnPage } from "@/lib/content/learn";
import { fetchAllPosts } from "@/lib/sanity/fetch";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Learn",
  description: learnPage.description,
  path: "/learn",
});

export const revalidate = 3600;

export default async function LearnRoute() {
  const cards = BLOG_PUBLIC ? resolveBlogCards(await fetchAllPosts()) : [];
  return <LearnPage posts={cards} />;
}
