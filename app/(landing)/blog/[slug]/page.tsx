import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogPostPage from "@/components/landing/BlogPostPage";
import {
  FALLBACK_BLOG_POSTS,
  mapPostToBlogCard,
} from "@/lib/content/blog";
import { fetchAllPostSlugs, fetchPostBySlug } from "@/lib/sanity/fetch";

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
    return {
      title: post.seo?.title || post.title,
      description: post.seo?.description || post.excerpt || undefined,
      alternates: { canonical: `/blog/${slug}` },
    };
  }
  const fallback = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!fallback) return { title: "Post" };
  return {
    title: fallback.title,
    description: fallback.excerpt,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostRoute({ params }: Props) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (post) {
    const card = mapPostToBlogCard(post);
    return (
      <BlogPostPage
        title={card.title}
        excerpt={card.excerpt}
        publishedAt={card.publishedAt}
        tags={card.tags}
        bannerSrc={card.bannerSrc}
        bannerAlt={card.bannerAlt}
        body={post.body}
      />
    );
  }

  const fallback = FALLBACK_BLOG_POSTS.find((p) => p.slug === slug);
  if (!fallback) notFound();

  return (
    <BlogPostPage
      title={fallback.title}
      excerpt={fallback.excerpt}
      publishedAt={fallback.publishedAt}
      tags={fallback.tags}
      bannerSrc={fallback.bannerSrc}
      bannerAlt={fallback.bannerAlt}
      body={null}
    />
  );
}
