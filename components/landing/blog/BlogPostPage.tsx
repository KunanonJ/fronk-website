import { useState } from "react";
import type { PortableTextBlock } from "@portabletext/react";
import Link from "@/components/navigation/Link";
import {
  Bento,
  BentoCard,
  BentoPair,
  CardKicker,
  CardLink,
  bentoSpan,
} from "@/components/bento/Bento";
import { CtaLink } from "@/components/bento/Buttons";
import { EyebrowChip } from "@/components/bento/Chips";
import SharePill from "@/components/bento/SharePill";
import {
  ArrowLeftIcon,
  BODY_LINK,
  BannerFigure,
  MONO_LABEL,
  PostRow,
} from "@/components/landing/blog/BlogParts";
import { PortableText } from "@/components/PortableText";
import {
  blogPage,
  formatBlogDate,
  relatedBlogPosts,
  type BlogCard,
} from "@/lib/content/blog";
import { linkifyInternalPaths } from "@/lib/content/linkify";
import type { NoteLink } from "@/lib/content/noteLinks";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * One post (bento canvas Post, design spec 4.18): the hero, the note beside
 * its details and links, then more posts on the same tag, "Keep reading"
 * and the contact card. Hidden with the blog while BLOG_PUBLIC is false.
 */

/** How many related posts a tag shows. */
const RELATED_LIMIT = 3;

function PostHero({ post }: { post: BlogCard }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col items-start gap-6"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <EyebrowChip className="self-center">Blog</EyebrowChip>
        <Link
          href="/blog"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium no-underline"
        >
          <ArrowLeftIcon />
          Back to Blog
        </Link>
      </div>
      <p className="m-0 flex flex-wrap items-center gap-2">
        <time
          dateTime={post.publishedAt.slice(0, 10)}
          className="mr-1 font-mono text-meta text-ink-2"
        >
          {formatBlogDate(post.publishedAt)}
        </time>
        {post.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              MONO_LABEL,
              "rounded-full border border-hairline-strong bg-surface px-2.5 py-1",
            )}
          >
            {tag}
          </span>
        ))}
      </p>
      <h1 id="hero-title" className="m-0 text-title text-ink">
        {post.title}
      </h1>
      <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
        {post.excerpt}
      </p>
      <SharePill />
    </section>
  );
}

/** Plain-text paragraphs (fallback posts), with site paths as links. */
function Paragraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return paragraphs.map((paragraph) => (
    <p
      key={paragraph.slice(0, 48)}
      className="m-0 text-[17px] leading-[1.7] text-ink"
    >
      {linkifyInternalPaths(paragraph).map((segment, index) =>
        segment.type === "link" ? (
          <Link
            key={`${segment.href}-${index}`}
            href={segment.href}
            className={BODY_LINK}
          >
            {segment.text}
          </Link>
        ) : (
          segment.text
        ),
      )}
    </p>
  ));
}

function NoteCard({
  post,
  body,
  paragraphs,
}: {
  post: BlogCard;
  body: PortableTextBlock[] | null;
  paragraphs: readonly string[];
}) {
  return (
    <BentoCard
      headingId="card-note"
      title="The note"
      gap={0}
      minHeight={false}
      className="min-w-0 flex-[999_1_560px] gap-5 pb-7"
    >
      <BannerFigure
        post={post}
        priority
        sizes="(min-width: 1024px) 640px, 100vw"
        className="aspect-[16/9]"
      />
      <div className="flex max-w-[620px] flex-col gap-5 px-1 pt-1">
        {body && body.length > 0 ? (
          <PortableText value={body} />
        ) : paragraphs.length > 0 ? (
          <Paragraphs paragraphs={paragraphs} />
        ) : (
          <p className="m-0 text-card leading-[1.55] text-ink-2">
            Full article body will appear here once published in Sanity Studio.
            This preview shows the title, banner, tags and excerpt only.
          </p>
        )}
      </div>
    </BentoCard>
  );
}

function DetailsCard({ post, author }: { post: BlogCard; author: string }) {
  const row = "flex flex-col gap-1 py-3";
  return (
    <BentoCard
      headingId="card-details"
      title="Details"
      gap={3}
      minHeight={false}
      className="min-w-0 flex-[1_1_260px] pb-3.5"
    >
      <dl className="m-0 flex flex-col">
        <div className={cn(row, "border-b border-hairline")}>
          <dt className={MONO_LABEL}>Published</dt>
          <dd className="m-0 font-mono text-sm">
            <time dateTime={post.publishedAt.slice(0, 10)}>
              {formatBlogDate(post.publishedAt)}
            </time>
          </dd>
        </div>
        <div
          className={cn(
            row,
            post.tags.length > 0 && "border-b border-hairline",
          )}
        >
          <dt className={MONO_LABEL}>Written by</dt>
          <dd className="m-0 text-card font-medium">{author}</dd>
        </div>
        {post.tags.length > 0 ? (
          <div className={cn(row, "gap-2")}>
            <dt className={MONO_LABEL}>Tags</dt>
            <dd className="m-0 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-surface-tint px-2.5 py-1 text-meta leading-none font-medium"
                >
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
    </BentoCard>
  );
}

function LinksCard({ links }: { links: readonly NoteLink[] }) {
  return (
    <BentoCard
      headingId="card-links"
      title="Linked in this note"
      gap={2}
      minHeight={false}
      className="min-w-0 flex-[1_1_260px] pb-3"
    >
      <ul className="m-0 flex list-none flex-col p-0">
        {links.map((link, i) => (
          <li
            key={link.href}
            className={cn(i < links.length - 1 && "border-b border-hairline")}
          >
            <Link
              href={link.href}
              {...(link.href.startsWith("/")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="flex min-h-[52px] items-center gap-3 py-1.5 font-mono text-meta no-underline"
            >
              <span className="shrink-0 text-ink-2">{pad2(i + 1)}</span>
              <span className="min-w-0 [overflow-wrap:anywhere]">
                {link.label} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

/** Other posts on one of this post's tags; the tag switch is local state. */
function RelatedCard({
  post,
  posts,
}: {
  post: BlogCard;
  posts: readonly BlogCard[];
}) {
  const groups = post.tags
    .map((tag) => ({ tag, list: relatedBlogPosts(posts, post.slug, tag) }))
    .filter((group) => group.list.length > 0);
  const [picked, setPicked] = useState(groups[0]?.tag ?? "");
  const current = groups.find((g) => g.tag === picked) ?? groups[0];
  if (!current) return null;
  const shown = current.list.slice(0, RELATED_LIMIT);
  const noun = current.list.length === 1 ? "post" : "posts";

  return (
    <article
      aria-labelledby="card-more"
      className={cn(
        "relative flex flex-col gap-3.5 overflow-hidden rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-3 text-ink shadow-card",
        bentoSpan(3),
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardKicker id="card-more">More on this tag</CardKicker>
        <div
          role="group"
          aria-label="Related posts by tag"
          className="flex flex-wrap gap-1 rounded-full border border-hairline bg-page p-[5px]"
        >
          {groups.map((group) => {
            const on = group.tag === current.tag;
            return (
              <button
                key={group.tag}
                type="button"
                aria-pressed={on}
                onClick={() => setPicked(group.tag)}
                className={cn(
                  "inline-flex min-h-11 flex-auto items-center gap-2 rounded-full border-0 px-[18px] text-sm font-medium",
                  on ? "bg-cta text-on-cta" : "bg-transparent text-ink-2",
                )}
              >
                {group.tag}{" "}
                <span
                  className={cn(
                    "font-mono text-xs",
                    on ? "text-on-cta" : "text-ink-2",
                  )}
                >
                  {group.list.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className={cn(MONO_LABEL, "m-0 px-1")}>
        Latest {shown.length} of {current.list.length} other {noun} tagged{" "}
        {current.tag}
      </p>
      <ol className="m-0 flex list-none flex-col p-0">
        {shown.map((related) => (
          <li key={related.id} className="border-t border-hairline">
            <PostRow post={related} />
          </li>
        ))}
      </ol>
    </article>
  );
}

/**
 * The post page body. `posts` is every post the page knows (for "More on
 * this tag" and "Keep reading"); `links` are the links found in the body.
 */
export default function BlogPostPage({
  post,
  author,
  body,
  paragraphs,
  posts,
  links,
}: {
  post: BlogCard;
  author: string;
  body: PortableTextBlock[] | null;
  paragraphs: readonly string[];
  posts: readonly BlogCard[];
  links: readonly NoteLink[];
}) {
  return (
    <>
      <PostHero post={post} />
      <div className="flex flex-wrap items-start gap-5">
        <NoteCard post={post} body={body} paragraphs={paragraphs} />
        <div className="flex min-w-0 flex-[1_1_280px] flex-wrap gap-5">
          <DetailsCard post={post} author={author} />
          {links.length > 0 ? <LinksCard links={links} /> : null}
        </div>
      </div>
      {/* Keyed by post: a client navigation to another post resets the tag. */}
      <Bento key={post.slug}>
        <RelatedCard post={post} posts={posts} />
      </Bento>
      <BentoPair>
        <BentoCard
          headingId="card-keep"
          title="Keep reading"
          gap={3.5}
          minHeight={false}
          className="min-h-60"
        >
          <div className="mt-auto">
            <p className="m-0 text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] tabular-nums">
              {posts.length}
            </p>
            <p className={cn(MONO_LABEL, "m-0 mt-0.5")}>Posts on the blog</p>
          </div>
          <p className="m-0 text-card leading-[1.55] text-ink-2">
            {blogPage.keepReading}
          </p>
          <CardLink href="/blog" className="self-start">
            Back to Blog →
          </CardLink>
        </BentoCard>
        <BentoCard
          headingId="card-eyes"
          title="A second set of eyes"
          gap={3.5}
          minHeight={false}
          className="min-h-60"
        >
          <p className="m-0 mt-auto text-[22px] leading-[1.3] font-semibold tracking-[-0.02em]">
            {siteConfig.tagline}
          </p>
          <div className="flex flex-wrap gap-3">
            <CtaLink href="/contact">Contact me</CtaLink>
          </div>
        </BentoCard>
      </BentoPair>
    </>
  );
}
