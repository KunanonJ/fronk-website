import { createServerFn } from "@tanstack/react-start";
import { setResponseHeaders } from "@tanstack/react-start/server";
import { NO_STORE } from "@/src/lib/cache";
import { pageHead } from "@/src/lib/head";
import {
  FALLBACK_BLOG_POSTS,
  mapPostToBlogCard,
  resolveBlogCards,
} from "@/lib/content/blog";
import { BLOG_PUBLIC, HIDDEN_BLOG_ROBOTS } from "@/lib/content/blogVisibility";
import { loadResumeProfile } from "@/lib/content/resumeProfile";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import {
  fetchAllPosts,
  fetchPostBySlug,
  fetchResumeProfile,
  fetchWritingPage,
} from "@/lib/sanity/fetch";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import type { Post } from "@/lib/sanity/types";
import type { Metadata } from "@/lib/seo/types";

/*
 * Sanity reads for the Start routes (tanstack-migration Phase 2). They run on
 * the server only, so the Sanity client never ships to the browser. Phase 4
 * wraps them in TanStack Query and the Worker cache; draft mode is gone.
 */

/** /blog metadata from the CMS writing page; hidden from search while BLOG_PUBLIC is off. */
function blogIndexMetadata(
  page: ReturnType<typeof resolveWritingPageContent>,
): Metadata {
  return {
    ...routeShareMeta({
      title: page.metadata.title,
      description: page.metadata.description,
      path: "/blog",
    }),
    ...(BLOG_PUBLIC ? {} : { robots: HIDDEN_BLOG_ROBOTS }),
  };
}

/** A post's metadata: the Sanity post when there is one, else its fallback copy. */
function blogPostMetadata(slug: string, post: Post | null): Metadata {
  const card = post
    ? mapPostToBlogCard(post)
    : FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!card) return { title: "Post" };
  const meta = routeShareMeta({
    title: post ? post.seo?.title || post.title : card.title,
    description: post
      ? post.seo?.description || post.excerpt || card.excerpt
      : card.excerpt,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: card.publishedAt,
    images: [card.bannerSrc],
  });
  return BLOG_PUBLIC ? meta : { ...meta, robots: HIDDEN_BLOG_ROBOTS };
}

/**
 * The résumé for /resume. A failed read falls back to the repo's résumé (see
 * loadResumeProfile), and neither the edge nor the browser's HTTP cache may
 * keep that stand-in. The route's `headers` say so for the page. On a
 * client-side navigation the browser fetches this function itself, and the
 * Worker cache would keep its answer for two hours (see NO_STORE), so the
 * function says so for its own response too. (The tab's query cache does
 * hold the stand-in, as stale: see resumeQuery.) A good read sets nothing
 * here: the page's edge headers are the route's to give, and headers set
 * here would also land on the page.
 */
export const getResumeProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const profile = await loadResumeProfile(fetchResumeProfile);
    if (profile.degraded) setResponseHeaders(new Headers(NO_STORE));
    return profile;
  },
);

export const getLearnCards = createServerFn({ method: "GET" }).handler(
  async () => (BLOG_PUBLIC ? resolveBlogCards(await fetchAllPosts()) : []),
);

export const getBlogIndex = createServerFn({ method: "GET" }).handler(
  async () => {
    // One read of the writing page feeds both the page and its metadata.
    const [posts, cmsPage] = await Promise.all([
      fetchAllPosts(),
      fetchWritingPage(),
    ]);
    // Head tags, not Metadata: Metadata may hold URL objects, which don't serialise.
    const page = resolveWritingPageContent(cmsPage);
    const metadata = blogIndexMetadata(page);
    return {
      cards: resolveBlogCards(posts),
      eyebrow: page.eyebrow,
      heading: page.heading,
      description: page.description,
      head: pageHead(metadata),
    };
  },
);

export const getBlogPost = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const post = await fetchPostBySlug(slug);
    if (!post && !FALLBACK_BLOG_POSTS.some((p) => p.slug === slug)) return null;
    const metadata = blogPostMetadata(slug, post);
    // The Sanity post crosses as JSON: its image types carry `unknown` fields.
    return {
      postJson: post ? JSON.stringify(post) : null,
      head: pageHead(metadata),
    };
  });
