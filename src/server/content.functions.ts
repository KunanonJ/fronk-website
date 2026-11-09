import { createServerFn } from "@tanstack/react-start";
import { pageHead } from "@/src/lib/head";
import { generateMetadata as blogIndexMetadata } from "@/app/(landing)/blog/page";
import { generateMetadata as blogPostMetadata } from "@/app/(landing)/blog/[slug]/page";
import { FALLBACK_BLOG_POSTS, resolveBlogCards } from "@/lib/content/blog";
import { BLOG_PUBLIC } from "@/lib/content/blogVisibility";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import { resolveWritingPageContent } from "@/lib/content/writingPage";
import { fetchAllPosts, fetchPostBySlug, fetchResumeProfile, fetchWritingPage } from "@/lib/sanity/fetch";

/*
 * Sanity reads for the Start routes (tanstack-migration Phase 2). They run on
 * the server only, so the Sanity client never ships to the browser. Phase 4
 * wraps them in TanStack Query and the Worker cache; draft mode is gone.
 */

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
    const metadata = await blogPostMetadata({ params: Promise.resolve({ slug }) });
    // The Sanity post crosses as JSON: its image types carry `unknown` fields.
    return { postJson: post ? JSON.stringify(post) : null, head: pageHead(metadata) };
  });
