import { useState, type ReactNode } from "react";
import type { PortableTextBlock } from "@portabletext/react";
import Link from "@/components/navigation/Link";
import SharePill from "@/components/bento/SharePill";
import { Pill } from "@/components/ds/Pill";
import { TextLink } from "@/components/ds/TextLink";
import {
  BODY_LINK,
  BannerFigure,
  PostRow,
} from "@/components/landing/blog/BlogParts";
import { PageHero } from "@/components/profile/pages/PageHero";
import { ToggleGroup } from "@/components/profile/catalog/ToggleGroup";
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
 * One post (profile redesign Phase 7h, a light restyle of the bento canvas
 * Post): the hero on the pixel sky, the note beside its details and links,
 * then more posts on the same tag, "Keep reading" and the contact tile.
 * Hidden with the blog while BLOG_PUBLIC is false. Styles: `.pf-blog*` in
 * src/styles/profile/pages-catalog.css.
 */

/** A tile named by its mono heading. */
function PostTile({
  id,
  title,
  className,
  children,
}: {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      aria-labelledby={id}
      className={cn("ds-tile pf-blog-tile", className)}
    >
      <h2 id={id} className="t-meta pf-cat-kicker">
        {title}
      </h2>
      {children}
    </article>
  );
}

/** How many related posts a tag shows. */
const RELATED_LIMIT = 3;

function PostHero({ post }: { post: BlogCard }) {
  return (
    <PageHero
      back={
        <TextLink href="/blog" arrow="left">
          Back to Blog
        </TextLink>
      }
      eyebrow="Blog"
      title={post.title}
      lead={post.excerpt}
    >
      <p className="pf-blog-hero__meta">
        <time
          dateTime={post.publishedAt.slice(0, 10)}
          className="t-meta pf-cat-note"
        >
          {formatBlogDate(post.publishedAt)}
        </time>
        {post.tags.map((tag) => (
          <span key={tag} className="ds-chip">
            {tag}
          </span>
        ))}
      </p>
      <div className="pf-cat-hero__actions">
        <SharePill />
      </div>
    </PageHero>
  );
}

/** Plain-text paragraphs (fallback posts), with site paths as links. */
function Paragraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return paragraphs.map((paragraph) => (
    <p key={paragraph.slice(0, 48)} className="t-prose pf-blog-note__text">
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
    <PostTile id="card-note" title="The note" className="pf-blog-note">
      <BannerFigure
        post={post}
        priority
        sizes="(min-width: 1024px) 640px, 100vw"
        className="pf-blog-note__banner"
      />
      <div className="pf-blog-note__body">
        {body && body.length > 0 ? (
          <PortableText value={body} />
        ) : paragraphs.length > 0 ? (
          <Paragraphs paragraphs={paragraphs} />
        ) : (
          <p className="t-small pf-cat-note">
            Full article body will appear here once published in Sanity Studio.
            This preview shows the title, banner, tags and excerpt only.
          </p>
        )}
      </div>
    </PostTile>
  );
}

function DetailsCard({ post, author }: { post: BlogCard; author: string }) {
  return (
    <PostTile id="card-details" title="Details">
      <dl className="pf-blog-details">
        <div className="pf-blog-details__row">
          <dt className="t-meta pf-cat-note">Published</dt>
          <dd className="pf-cat-code">
            <time dateTime={post.publishedAt.slice(0, 10)}>
              {formatBlogDate(post.publishedAt)}
            </time>
          </dd>
        </div>
        <div className="pf-blog-details__row">
          <dt className="t-meta pf-cat-note">Written by</dt>
          <dd className="pf-cat-title">{author}</dd>
        </div>
        {post.tags.length > 0 ? (
          <div className="pf-blog-details__row">
            <dt className="t-meta pf-cat-note">Tags</dt>
            <dd className="pf-blog-details__tags">
              {post.tags.map((tag) => (
                <span key={tag} className="ds-chip">
                  {tag}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
    </PostTile>
  );
}

function LinksCard({ links }: { links: readonly NoteLink[] }) {
  return (
    <PostTile id="card-links" title="Linked in this note">
      <ul className="pf-blog-links">
        {links.map((link, i) => (
          <li key={link.href} className="pf-blog-links__item">
            <Link
              href={link.href}
              {...(link.href.startsWith("/")
                ? {}
                : { target: "_blank", rel: "noopener noreferrer" })}
              className="pf-blog-links__link"
            >
              <span className="t-meta pf-cat-note">{pad2(i + 1)}</span>
              <span className="pf-blog-links__label">{link.label} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </PostTile>
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
    <PostTile id="card-more" title="More on this tag" className="pf-blog-more">
      <ToggleGroup
        label="Related posts by tag"
        value={current.tag}
        onChange={setPicked}
        options={groups.map((group) => ({
          value: group.tag,
          label: group.tag,
          count: group.list.length,
        }))}
      />
      <p aria-live="polite" className="t-meta pf-cat-note">
        Latest {shown.length} of {current.list.length} other {noun} tagged{" "}
        {current.tag}
      </p>
      <ol className="pf-blog-list">
        {shown.map((related) => (
          <li key={related.id} className="pf-blog-list__item">
            <PostRow post={related} />
          </li>
        ))}
      </ol>
    </PostTile>
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
      <div className="ds-wrap pf-cat-section pf-cat-end pf-blog-post">
        <div className="pf-blog-post__top">
          <NoteCard post={post} body={body} paragraphs={paragraphs} />
          <div className="pf-blog-post__side">
            <DetailsCard post={post} author={author} />
            {links.length > 0 ? <LinksCard links={links} /> : null}
          </div>
        </div>
        {/* Keyed by post: a client navigation to another post resets the tag. */}
        <RelatedCard key={post.slug} post={post} posts={posts} />
        <div className="pf-blog-post__pair">
          <PostTile id="card-keep" title="Keep reading">
            <div>
              <p className="t-title pf-cat-title">{posts.length}</p>
              <p className="t-meta pf-cat-note">Posts on the blog</p>
            </div>
            <p className="t-small pf-cat-note">{blogPage.keepReading}</p>
            <div className="pf-blog-tile__end">
              <TextLink href="/blog">Back to Blog</TextLink>
            </div>
          </PostTile>
          <PostTile id="card-eyes" title="A second set of eyes">
            <p className="t-statement pf-cat-title">{siteConfig.tagline}</p>
            <div className="pf-blog-tile__end">
              <Pill href="/contact">Contact me</Pill>
            </div>
          </PostTile>
        </div>
      </div>
    </>
  );
}
