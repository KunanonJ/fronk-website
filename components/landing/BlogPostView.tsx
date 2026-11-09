import { notFound } from "next/navigation";
import BlogPostPage from "@/components/landing/BlogPostPage";
import { FALLBACK_BLOG_POSTS, mapPostToBlogCard } from "@/lib/content/blog";
import type { Post } from "@/lib/sanity/types";
import { buildArticleJsonLd } from "@/lib/seo/jsonLd";

/**
 * One blog post: the Sanity post when there is one, otherwise the fallback
 * copy for that slug, otherwise a 404. Shared by the Next page and the
 * TanStack Start route, which each fetch the post their own way.
 */
export default function BlogPostView({ slug, post }: { slug: string; post: Post | null }) {

  if (post) {
    const card = mapPostToBlogCard(post);
    const articleLd = JSON.stringify(
      buildArticleJsonLd({
        title: card.title,
        description: card.excerpt,
        slug: card.slug,
        publishedAt: card.publishedAt,
        imageUrl: card.bannerSrc,
        tags: card.tags,
      }),
    );
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: articleLd }}
        />
        <BlogPostPage
          title={card.title}
          excerpt={card.excerpt}
          publishedAt={card.publishedAt}
          tags={card.tags}
          bannerSrc={card.bannerSrc}
          bannerAlt={card.bannerAlt}
          body={post.body}
        />
      </>
    );
  }

  const fallback = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!fallback) notFound();

  const articleLd = JSON.stringify(
    buildArticleJsonLd({
      title: fallback.title,
      description: fallback.excerpt,
      slug: fallback.slug,
      publishedAt: fallback.publishedAt,
      imageUrl: fallback.bannerSrc,
      tags: fallback.tags,
    }),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleLd }}
      />
      <BlogPostPage
        title={fallback.title}
        excerpt={fallback.excerpt}
        publishedAt={fallback.publishedAt}
        tags={fallback.tags}
        bannerSrc={fallback.bannerSrc}
        bannerAlt={fallback.bannerAlt}
        body={null}
        bodyParagraphs={fallback.bodyParagraphs}
      />
    </>
  );
}
