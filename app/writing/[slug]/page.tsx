import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { DraftBanner } from "@/components/DraftBanner";
import { PostAuthor } from "@/components/PostAuthor";
import { Prose } from "@/components/ui/Prose";
import { PortableText } from "@/components/PortableText";
import { resolvePostMetadata } from "@/lib/content/postMetadata";
import {
  fetchAllPostSlugs,
  fetchPostBySlug,
} from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/client";
import type { Post } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/site";
import { formatDate } from "@/lib/utils/formatDate";
import { readingTimeFromBlocks } from "@/lib/utils/readingTime";

function buildBlogPostingJsonLd(post: Post): string {
  const authorName = post.author?.name ?? siteConfig.name;
  const author: Record<string, unknown> = {
    "@type": "Person",
    name: authorName,
    url: siteConfig.url,
  };

  const metadata = resolvePostMetadata(post);

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

  if (metadata.description) {
    payload.description = metadata.description;
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
  const { isEnabled: preview } = await draftMode();
  const post = await fetchPostBySlug(slug, { preview });
  if (!post) return { title: "Not found" };

  const metadata = resolvePostMetadata(post);

  return {
    title: metadata.title,
    description: metadata.description,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
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
  const { isEnabled: preview } = await draftMode();
  const post = await fetchPostBySlug(slug, { preview });
  if (!post) notFound();

  const { minutes } = readingTimeFromBlocks(post.body);
  const blogPostingJsonLd: string = buildBlogPostingJsonLd(post);
  const exitPath = `/writing/${slug}`;

  return (
    <>
      {preview && <DraftBanner exitPath={exitPath} />}
      <Container size="lg" className="py-20">
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
          {post.excerpt ? (
            <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
          ) : null}
        </header>

        {post.author ? (
          <div className="mb-12">
            <PostAuthor author={post.author} />
          </div>
        ) : null}

        {post.coverImage ? (
          <Image
            src={urlFor(post.coverImage).width(1600).fit("max").auto("format").url()}
            alt={post.coverImage.alt ?? post.title}
            width={1600}
            height={900}
            priority
            className="mb-12 h-auto w-full rounded-xl border border-border"
            sizes="(min-width: 768px) 720px, 100vw"
          />
        ) : null}

        <Prose>
          <PortableText value={post.body} />
        </Prose>
      </Container>
    </>
  );
}
