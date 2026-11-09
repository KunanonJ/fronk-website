import { createServerFn } from "@tanstack/react-start";
import { pageHead } from "@/src/lib/head";
import { FALLBACK_BLOG_POSTS, mapPostToBlogCard, resolveBlogCards } from "@/lib/content/blog";
import { BLOG_PUBLIC, HIDDEN_BLOG_ROBOTS } from "@/lib/content/blogVisibility";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import { fetchAllPosts, fetchPostBySlug, fetchResumeProfile, fetchWritingPage } from "@/lib/sanity/fetch";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import type { Post } from "@/lib/sanity/types";
import type { Metadata } from "@/lib/seo/types";

/*
 * Sanity reads for the Start routes (tanstack-migration Phase 2). They run on
 * the server only, so the Sanity client never ships to the browser. Phase 4
 * wraps them in TanStack Query and the Worker cache; draft mode is gone.
 */

/** /blog metadata from the CMS writing page; hidden from search while BLOG_PUBLIC is off. */
async function blogIndexMetadata(): Promise<Metadata> {
  const page = resolveWritingPageContent(await fetchWritingPage());
  return {
    ...routeShareMeta({ title: page.metadata.title, description: page.metadata.description, path: "/blog" }),
    ...(BLOG_PUBLIC ? {} : { robots: HIDDEN_BLOG_ROBOTS }),
  };
}

/** A post's metadata: the Sanity post when there is one, else its fallback copy. */
function blogPostMetadata(slug: string, post: Post | null): Metadata {
  const card = post ? mapPostToBlogCard(post) : FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!card) return { title: "Post" };
  const meta = routeShareMeta({
    title: post ? post.seo?.title || post.title : card.title,
    description: post ? post.seo?.description || post.excerpt || card.excerpt : card.excerpt,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: card.publishedAt,
    images: [card.bannerSrc],
  });
  return BLOG_PUBLIC ? meta : { ...meta, robots: HIDDEN_BLOG_ROBOTS };
}

export const getResumeProfile = createServerFn({ method: "GET" }).handler(async () =>
  resolveResumeProfile(await fetchResumeProfile()),
);

export const getLearnCards = createServerFn({ method: "GET" }).handler(async () =>
  BLOG_PUBLIC ? resolveBlogCards(await fetchAllPosts()) : [],
);

export const getBlogIndex = createServerFn({ method: "GET" }).handler(async () => {
  const [posts, cmsPage, metadata] = await Promise.all([fetchAllPosts(), fetchWritingPage(), blogIndexMetadata()]);
  // Head tags, not Metadata: Metadata may hold URL objects, which don't serialise.
  const page = resolveWritingPageContent(cmsPage);
  return {
    cards: resolveBlogCards(posts),
    eyebrow: page.eyebrow,
    heading: page.heading,
    description: page.description,
    head: pageHead(metadata),
  };
});

export const getBlogPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = await fetchPostBySlug(slug);
    if (!post && !FALLBACK_BLOG_POSTS.some((p) => p.slug === slug)) return null;
    const metadata = blogPostMetadata(slug, post);
    // The Sanity post crosses as JSON: its image types carry `unknown` fields.
    return { postJson: post ? JSON.stringify(post) : null, head: pageHead(metadata) };
  });
