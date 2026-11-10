import { notFound } from "@/lib/router/navigation";
import { serializeJsonLd } from "@/lib/seo/serializeJsonLd";
import BlogPostPage from "@/components/landing/blog/BlogPostPage";
import {
  FALLBACK_BLOG_POSTS,
  blogPage,
  mapPostToBlogCard,
  resolveBlogCards,
} from "@/lib/content/blog";
import { paragraphLinks, portableTextLinks } from "@/lib/content/noteLinks";
import type { Post } from "@/lib/sanity/types";
import { buildArticleJsonLd } from "@/lib/seo/jsonLd";

/**
 * One blog post: the Sanity post when there is one, otherwise the fallback
 * copy for that slug, otherwise a 404. The route loads the post (its loader
 * is unchanged in 7g), so "More on this tag" and "Keep reading" draw on the
 * cornerstone posts plus this one.
 */
export default function BlogPostView({
  slug,
  post,
}: {
  slug: string;
  post: Post | null;
}) {
  const card = post
    ? mapPostToBlogCard(post)
    : FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!card) notFound();

  const articleLd = serializeJsonLd(
    buildArticleJsonLd({
      title: card.title,
      description: card.excerpt,
      slug: card.slug,
      publishedAt: card.publishedAt,
      imageUrl: card.bannerSrc,
      tags: card.tags,
    }),
  );
  const body = post?.body ?? null;
  const paragraphs = post ? [] : (card.bodyParagraphs ?? []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleLd }}
      />
      <BlogPostPage
        post={card}
        author={post?.author?.name?.trim() || blogPage.author}
        body={body}
        paragraphs={paragraphs}
        posts={resolveBlogCards(post ? [post] : [])}
        links={
          body && body.length > 0
            ? portableTextLinks(body)
            : paragraphLinks(paragraphs)
        }
      />
    </>
  );
}
