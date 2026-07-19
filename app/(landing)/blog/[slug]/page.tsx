import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/landing/BlogPostPage";
import {
  FALLBACK_BLOG_POSTS,
  mapPostToBlogCard,
} from "@/lib/content/blog";
import { fetchAllPostSlugs, fetchPostBySlug } from "@/lib/sanity/fetch";
import { buildArticleJsonLd } from "@/lib/seo/jsonLd";
import { routeShareMeta } from "@/lib/seo/routeMeta";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs();
  const fromCms = slugs.map((slug) => ({ slug }));
  const fromFallback = FALLBACK_BLOG_POSTS.map((p) => ({ slug: p.slug }));
  const seen = new Set<string>();
  return [...fromCms, ...fromFallback].filter(({ slug }) => {
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (post) {
    const card = mapPostToBlogCard(post);
    return routeShareMeta({
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt || card.excerpt,
      path: `/blog/${slug}`,
      type: "article",
      publishedTime: card.publishedAt,
      images: [card.bannerSrc],
    });
  }
  const fallback = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!fallback) return { title: "Post" };
  return routeShareMeta({
    title: fallback.title,
    description: fallback.excerpt,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: fallback.publishedAt,
    images: [fallback.bannerSrc],
  });
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

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
      />
    </>
  );
}
