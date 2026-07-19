"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import {
  blogPage,
  collectBlogTags,
  filterBlogPosts,
  formatBlogDate,
  type BlogCard,
} from "@/lib/content/blog";
import { expandHashHref } from "@/lib/landing/nav";

function BlogCardView({ post }: { post: BlogCard }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition-colors hover:border-white/25">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-black/40"
      >
        <Image
          src={post.bannerSrc}
          alt={post.bannerAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <time
            dateTime={post.publishedAt}
            className="text-[10px] uppercase tracking-[0.16em] text-primary/50"
          >
            {formatBlogDate(post.publishedAt)}
          </time>
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-primary/60"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-lg font-medium leading-snug tracking-tight text-primary sm:text-xl">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-opacity hover:opacity-80"
          >
            {post.title}
          </Link>
        </h2>

        <p className="line-clamp-2 text-sm leading-relaxed text-primary/65">
          {post.excerpt}
        </p>

        <div className="mt-auto pt-2">
          <Link
            href={`/blog/${post.slug}`}
            className="group/cta inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-white/35 hover:bg-white/10"
          >
            Read
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

type BlogIndexProps = {
  posts: readonly BlogCard[];
  heading: string;
  description: string;
  eyebrow: string;
};

/**
 * Blog index with banner cards, tags, and client-side search + tag filter.
 * Content is managed in Sanity Studio (`post` documents).
 */
export default function BlogIndex({
  posts,
  heading,
  description,
  eyebrow,
}: BlogIndexProps) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(() => collectBlogTags(posts), [posts]);
  const filtered = useMemo(
    () => filterBlogPosts(posts, { query, tag: activeTag }),
    [posts, query, activeTag],
  );

  return (
    <div className="relative min-h-[100svh] bg-landing text-primary">
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId="blog-mobile-nav"
      />

      <main id="main" className="relative z-10 px-4 pb-20 pt-28 sm:px-6 md:px-10">
        <header className="mx-auto mb-8 max-w-6xl sm:mb-10">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/60 sm:text-xs">
            {eyebrow}
          </p>
          <h1
            className="text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl"
            style={{
              fontFamily:
                "var(--font-instrument-serif), 'Instrument Serif', serif",
            }}
          >
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary/65 sm:text-base">
            {description}
          </p>
        </header>

        <div className="mx-auto mb-8 flex max-w-6xl flex-col gap-4 sm:mb-10">
          <label className="relative block w-full max-w-xl">
            <span className="sr-only">Search posts</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-primary/40"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={blogPage.searchPlaceholder}
              className="w-full rounded-full border border-white/15 bg-white/5 py-3 pr-4 pl-11 text-sm text-primary placeholder:text-primary/40 outline-none transition focus:border-white/35 focus:ring-2 focus:ring-white/10"
            />
          </label>

          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter by tag"
          >
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTag === null
                  ? "border-cream/40 bg-cream text-black"
                  : "border-white/15 bg-transparent text-primary/70 hover:border-white/35 hover:text-primary"
              }`}
            >
              {blogPage.allTagsLabel}
            </button>
            {tags.map((tag) => {
              const active = activeTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(active ? null : tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-cream/40 bg-cream text-black"
                      : "border-white/15 bg-transparent text-primary/70 hover:border-white/35 hover:text-primary"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mx-auto max-w-6xl text-sm text-primary/55">
            {blogPage.emptyLabel}
          </p>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {filtered.map((post) => (
              <BlogCardView key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
