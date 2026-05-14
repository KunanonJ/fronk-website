import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Prose } from "@/components/ui/Prose";
import { PortableText } from "@/components/PortableText";
import {
  fetchAllPostSlugs,
  fetchPostBySlug,
} from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/client";
import type { Post } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils/formatDate";
import { readingTimeFromBlocks } from "@/lib/utils/readingTime";

// Build a schema.org BlogPosting JSON-LD payload for a single post. Author and
// publisher both resolve to the same Person identity used in the root layout.
function buildBlogPostingJsonLd(post: Post): string {
  const author: Record<string, unknown> = {
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
  };

  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author,
    publisher: author,
    mainEntityOfPage: `${siteConfig.url}/writing/${post.slug}`,
  };

  if (post.excerpt) {
    payload.description = post.excerpt;
  }

  if (post.coverImage) {
    payload.image = urlFor(post.coverImage)
      .width(1200)
      .height(630)
      .fit("crop")
      .url();
  }

  return JSON.stringify(payload);
}

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.coverImage
        ? [urlFor(post.coverImage).width(1200).height(630).fit("crop").url()]
        : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) notFound();

  const { minutes } = readingTimeFromBlocks(post.body);
  const blogPostingJsonLd: string = buildBlogPostingJsonLd(post);

  return (
    <Container size="lg" className="py-20">
      {/* schema.org BlogPosting. Content built from trusted Sanity data
          serialized through JSON.stringify — no XSS surface. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: blogPostingJsonLd }}
      />
      <Link
        href="/writing"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" /> All writing
      </Link>

      <header className="mt-8 mb-12">
        <div className="flex flex-wrap items-baseline gap-3 text-sm text-muted">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span>•</span>
          <span>{minutes} min read</span>
          {post.tags && post.tags.length > 0 && (
            <>
              <span>•</span>
              <span>{post.tags.join(", ")}</span>
            </>
          )}
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
        )}
      </header>

      {post.coverImage && (
        <Image
          src={urlFor(post.coverImage).width(1600).fit("max").auto("format").url()}
          alt={post.coverImage.alt ?? post.title}
          width={1600}
          height={900}
          priority
          className="mb-12 h-auto w-full rounded-xl border border-border"
          sizes="(min-width: 768px) 720px, 100vw"
        />
      )}

      <Prose>
        <PortableText value={post.body} />
      </Prose>
    </Container>
  );
}
