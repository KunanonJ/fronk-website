"use client";

import Image from "next/image";
import Link from "next/link";
import type { PortableTextBlock } from "@portabletext/react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import { PortableText } from "@/components/PortableText";
import { formatBlogDate } from "@/lib/content/blog";
import { expandHashHref } from "@/lib/landing/nav";

type BlogPostPageProps = {
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: readonly string[];
  bannerSrc: string;
  bannerAlt: string;
  body: PortableTextBlock[] | null;
};

export default function BlogPostPage({
  title,
  excerpt,
  publishedAt,
  tags,
  bannerSrc,
  bannerAlt,
  body,
}: BlogPostPageProps) {
  return (
    <div className="relative min-h-[100svh] bg-black text-primary">
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId="blog-post-mobile-nav"
      />

      <main id="main" className="relative z-10 px-4 pb-24 pt-28 sm:px-6 md:px-10">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="text-xs text-primary/55 transition-colors hover:text-primary"
          >
            ← Back to Blog
          </Link>

          <header className="mt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <time
                dateTime={publishedAt}
                className="text-[10px] uppercase tracking-[0.16em] text-primary/50"
              >
                {formatBlogDate(publishedAt)}
              </time>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary/60"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1
              className="text-4xl font-medium tracking-tight text-primary sm:text-5xl"
              style={{
                fontFamily:
                  "var(--font-instrument-serif), 'Instrument Serif', serif",
              }}
            >
              {title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary/70">
              {excerpt}
            </p>
          </header>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={bannerSrc}
              alt={bannerAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <div className="prose prose-invert mt-10 max-w-none prose-headings:font-medium prose-a:text-primary prose-p:text-primary/80">
            {body && body.length > 0 ? (
              <PortableText value={body} />
            ) : (
              <p className="text-sm text-primary/60">
                Full article body will appear here once published in Sanity
                Studio. This fallback preview shows title, banner, tags, and
                excerpt only.
              </p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
