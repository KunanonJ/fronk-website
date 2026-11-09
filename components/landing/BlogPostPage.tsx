import Image from "@/components/ui/Image";
import Link from "@/components/navigation/Link";
import type { PortableTextBlock } from "@portabletext/react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import { PortableText } from "@/components/PortableText";
import { formatBlogDate } from "@/lib/content/blog";
import { linkifyInternalPaths } from "@/lib/content/linkify";
import { expandHashHref } from "@/lib/landing/nav";

type BlogPostPageProps = {
  title: string;
  excerpt: string;
  publishedAt: string;
  tags: readonly string[];
  bannerSrc: string;
  bannerAlt: string;
  body: PortableTextBlock[] | null;
  bodyParagraphs?: readonly string[];
};

export default function BlogPostPage({
  title,
  excerpt,
  publishedAt,
  tags,
  bannerSrc,
  bannerAlt,
  body,
  bodyParagraphs,
}: BlogPostPageProps) {
  const hasPortable = Boolean(body && body.length > 0);
  const hasParagraphs = Boolean(bodyParagraphs && bodyParagraphs.length > 0);

  return (
    <div className="relative min-h-[100svh] bg-page text-ink">
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
            className="text-xs text-ink/70 transition-colors hover:text-ink"
          >
            ← Back to Blog
          </Link>

          <header className="mt-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <time
                dateTime={publishedAt}
                className="font-mono text-label uppercase text-ink-2"
              >
                {formatBlogDate(publishedAt)}
              </time>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-chip border border-hairline-strong bg-surface px-2 py-0.5 font-mono text-label uppercase text-ink-2"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1
              className="text-4xl font-medium tracking-tight text-ink sm:text-5xl"
            >
              {title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-ink/70">
              {excerpt}
            </p>
          </header>

          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-ink/10">
            <Image
              src={bannerSrc}
              alt={bannerAlt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <div className="prose dark:prose-invert mt-10 max-w-none prose-headings:font-medium prose-a:text-ink prose-p:text-ink/80">
            {hasPortable ? (
              <PortableText value={body!} />
            ) : hasParagraphs ? (
              bodyParagraphs!.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="text-base leading-relaxed text-ink/80">
                  {linkifyInternalPaths(paragraph).map((segment, index) =>
                    segment.type === "link" ? (
                      <Link
                        key={`${segment.href}-${index}`}
                        href={segment.href}
                        className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                      >
                        {segment.text}
                      </Link>
                    ) : (
                      segment.text
                    ),
                  )}
                </p>
              ))
            ) : (
              <p className="text-sm text-ink/70">
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
