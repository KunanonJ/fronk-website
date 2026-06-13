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
          className="label-mono text-subtle transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All writing
        </Link>

        <header className="mb-12 mt-8 border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <time dateTime={post.publishedAt} className="label-mono text-subtle">
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden className="text-subtle">
              ·
            </span>
            <span className="label-mono text-subtle">{minutes} min read</span>
            {post.tags && post.tags.length > 0 && (
              <>
                <span aria-hidden className="text-subtle">
                  ·
                </span>
                <span className="label-mono text-subtle">
                  {post.tags.join(" · ")}
                </span>
              </>
            )}
          </div>
          <h1 className="mt-5 font-display text-4xl font-light leading-[1.05] tracking-tight text-fg sm:text-6xl">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-5 max-w-2xl text-balance text-lg text-muted">
              {post.excerpt}
            </p>
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
            className="mb-12 h-auto w-full border border-border bg-surface"
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
