import { Fragment, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Bento, BentoCard, CardLink } from "@/components/bento/Bento";
import { EyebrowChip } from "@/components/bento/Chips";
import {
  BannerFigure,
  MONO_LABEL,
  PostRow,
} from "@/components/landing/blog/BlogParts";
import {
  BLOG_VENTURE_TAGS,
  blogPage,
  collectBlogTags,
  countBlogTags,
  filterBlogPosts,
  formatBlogDate,
  matchBlogTag,
  pickCornerstone,
  sortBlogPosts,
  type BlogCard,
} from "@/lib/content/blog";
import { getVentureBySlug } from "@/lib/content/ventures";
import { cn } from "@/lib/utils/cn";

/*
 * /blog (bento canvas Blog, design spec 4.17). Hidden while BLOG_PUBLIC is
 * false: noindex, and no public page links here. Posts come from Sanity
 * merged with the cornerstone fallbacks (the route's loader).
 */

const TONE = {
  muted: "text-ink-3",
  accent: "text-mark",
} as const;

function BlogHero({ eyebrow }: { eyebrow: string }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col items-start gap-6"
    >
      <EyebrowChip>{eyebrow}</EyebrowChip>
      {/* Each line is a block child, so `kj-lines` slides them in turn. */}
      <h1 id="hero-title" className="kj-lines m-0 text-title text-ink">
        {blogPage.headline.map((line, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span className="block">
              {line.map((part, j) => (
                <Fragment key={j}>
                  {j > 0 ? " " : null}
                  {part.tone ? (
                    <span className={TONE[part.tone]}>{part.text}</span>
                  ) : (
                    part.text
                  )}
                </Fragment>
              ))}
            </span>
          </Fragment>
        ))}
      </h1>
      <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
        {blogPage.lead}
      </p>
    </section>
  );
}

function CornerstoneCard({ post }: { post: BlogCard }) {
  return (
    <BentoCard
      headingId="card-featured"
      title="Cornerstone"
      span={2}
      minHeight={false}
      className="min-h-80"
    >
      <div className="flex flex-auto flex-wrap gap-5">
        <BannerFigure
          post={post}
          sizes="(min-width: 1024px) 320px, 100vw"
          className="min-h-[200px] min-w-0 flex-[1_1_240px]"
        />
        <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
          <p
            className={cn(
              MONO_LABEL,
              "m-0 flex flex-wrap items-center gap-x-2 gap-y-1.5",
            )}
          >
            <time dateTime={post.publishedAt.slice(0, 10)}>
              {formatBlogDate(post.publishedAt)}
            </time>
            {post.tags.map((tag) => (
              <span key={tag} className="contents">
                <span aria-hidden>·</span>
                <span>{tag}</span>
              </span>
            ))}
          </p>
          <h3 className="m-0 text-[clamp(24px,3vw,30px)] leading-[1.15] font-semibold tracking-[-0.03em]">
            {post.title}
          </h3>
          <p className="m-0 text-card leading-[1.55] text-ink-2">
            {post.excerpt}
          </p>
          <CardLink href={`/blog/${post.slug}`} className="mt-auto self-start">
            Read<span className="sr-only">: {post.title}</span>&nbsp;→
          </CardLink>
        </div>
      </div>
    </BentoCard>
  );
}

function ArchiveCard({
  posts,
  tagCount,
}: {
  posts: readonly BlogCard[];
  tagCount: number;
}) {
  const latest = posts[0];
  const first = posts[posts.length - 1];
  const stats = [
    { value: posts.length, label: "Posts" },
    { value: tagCount, label: "Tags" },
  ];
  const dates = [
    { label: "Latest", post: latest },
    { label: "First", post: first },
  ];
  return (
    <BentoCard
      headingId="card-archive"
      title="Archive"
      minHeight={false}
      className="min-h-80"
    >
      <dl className="m-0 mt-auto grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse">
            <dt className={cn(MONO_LABEL, "mt-0.5")}>{stat.label}</dt>
            <dd className="m-0 text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <dl className="m-0 flex flex-col">
        {dates.map(({ label, post }) =>
          post ? (
            <div
              key={label}
              className="flex justify-between gap-3 border-t border-hairline py-2.5"
            >
              <dt className={MONO_LABEL}>{label}</dt>
              <dd className="m-0 font-mono text-meta">
                <time dateTime={post.publishedAt.slice(0, 10)}>
                  {formatBlogDate(post.publishedAt)}
                </time>
              </dd>
            </div>
          ) : null,
        )}
      </dl>
    </BentoCard>
  );
}

function VenturesCard({
  tags,
  counts,
  active,
  onPick,
}: {
  tags: readonly string[];
  counts: ReadonlyMap<string, number>;
  active: string | null;
  onPick: (tag: string) => void;
}) {
  const rows = BLOG_VENTURE_TAGS.flatMap(({ tag, venture }) => {
    const name = matchBlogTag(tags, tag);
    const logo = getVentureBySlug(venture)?.logo;
    return name && logo ? [{ name, logo, count: counts.get(name) ?? 0 }] : [];
  });
  if (rows.length === 0) return null;
  return (
    <BentoCard
      headingId="card-ventures"
      title="In these notes"
      gap={3}
      minHeight={false}
      className="min-h-[300px]"
    >
      <div
        role="group"
        aria-label="Filter by venture"
        className="mt-1 flex flex-col gap-1.5"
      >
        {rows.map((row) => {
          const on = active === row.name;
          return (
            <button
              key={row.name}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? "" : row.name)}
              className={cn(
                "kj-row flex min-h-16 w-full items-center gap-3 rounded-[18px] border px-2.5 py-2 text-left text-ink",
                on
                  ? "border-hairline-strong bg-surface-tint"
                  : "border-hairline bg-transparent",
              )}
            >
              <img
                src={row.logo}
                alt=""
                width={44}
                height={44}
                className="size-11 shrink-0 rounded-tile border border-hairline object-cover"
              />
              <span className="flex min-w-0 flex-col items-start">
                <span className="text-card font-semibold">{row.name}</span>
                <span className="text-meta text-ink-2">
                  {row.count} {row.count === 1 ? "post" : "posts"} tagged{" "}
                  {row.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <CardLink href="/#ventures" className="mt-auto self-start">
        Ventures →
      </CardLink>
    </BentoCard>
  );
}

const CHIP =
  "inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-medium";

function TagChip({
  label,
  count,
  on,
  onClick,
}: {
  label: string;
  count: number;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        CHIP,
        on
          ? "border-cta bg-cta text-on-cta"
          : "border-hairline-strong bg-surface text-ink",
      )}
    >
      {label}{" "}
      <span
        className={cn("font-mono text-xs", on ? "text-on-cta" : "text-ink-2")}
      >
        {count}
      </span>
    </button>
  );
}

function SearchCard({
  query,
  onQuery,
  tags,
  counts,
  total,
  active,
  onPick,
  shown,
}: {
  query: string;
  onQuery: (value: string) => void;
  tags: readonly string[];
  counts: ReadonlyMap<string, number>;
  total: number;
  active: string | null;
  onPick: (tag: string) => void;
  shown: number;
}) {
  return (
    <BentoCard
      headingId="card-find"
      title="Search or filter"
      span={2}
      gap={3.5}
      minHeight={false}
      className="min-h-[300px]"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="blog-search"
          className="text-meta font-medium text-ink-2"
        >
          {blogPage.searchLabel}
        </label>
        <div className="relative">
          <Search
            aria-hidden
            size={16}
            strokeWidth={1.8}
            className="pointer-events-none absolute top-[18px] left-[18px] text-ink-2"
          />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={blogPage.searchPlaceholder}
            autoComplete="off"
            className="h-[52px] w-full rounded-full border border-hairline-strong bg-page pr-[18px] pl-11 text-base text-ink placeholder:text-ink-2"
          />
        </div>
      </div>
      <div
        role="group"
        aria-label="Filter by tag"
        className="flex flex-wrap gap-1.5"
      >
        <TagChip
          label={blogPage.allTagsLabel}
          count={total}
          on={active === null}
          onClick={() => onPick("")}
        />
        {tags.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            count={counts.get(tag) ?? 0}
            on={active === tag}
            onClick={() => onPick(active === tag ? "" : tag)}
          />
        ))}
      </div>
      <p
        aria-live="polite"
        className={cn(MONO_LABEL, "m-0 mt-auto flex items-center gap-2")}
      >
        <span aria-hidden className="size-1.5 shrink-0 bg-mark" />
        Showing {shown} of {total} posts{active ? ` tagged ${active}` : ""}
      </p>
    </BentoCard>
  );
}

/**
 * The blog index body. `tag` and `query` are the typed `?tag=` and `?q=`
 * params; the route writes changes back to the URL. The search box keeps
 * its own text so typing never waits on the router.
 */
export default function BlogIndexPage({
  posts,
  eyebrow,
  tag,
  query,
  onTagChange,
  onQueryChange,
}: {
  posts: readonly BlogCard[];
  eyebrow: string;
  tag: string;
  query: string;
  onTagChange: (tag: string) => void;
  onQueryChange: (query: string) => void;
}) {
  const sorted = useMemo(() => sortBlogPosts(posts), [posts]);
  const tags = useMemo(() => collectBlogTags(sorted), [sorted]);
  const counts = useMemo(() => countBlogTags(sorted), [sorted]);
  const [draft, setDraft] = useState(query);
  // A tag no post carries (an old link, a typo) shows everything.
  const active = matchBlogTag(tags, tag);
  const filtered = filterBlogPosts(sorted, { query: draft, tag: active });
  const cornerstone = pickCornerstone(sorted);

  return (
    <>
      <BlogHero eyebrow={eyebrow} />
      <Bento>
        {cornerstone ? <CornerstoneCard post={cornerstone} /> : null}
        <ArchiveCard posts={sorted} tagCount={tags.length} />
        <VenturesCard
          tags={tags}
          counts={counts}
          active={active}
          onPick={onTagChange}
        />
        <SearchCard
          query={draft}
          onQuery={(value) => {
            setDraft(value);
            onQueryChange(value);
          }}
          tags={tags}
          counts={counts}
          total={sorted.length}
          active={active}
          onPick={onTagChange}
          shown={filtered.length}
        />
        <BentoCard
          headingId="card-posts"
          title="Posts"
          span={3}
          gap={2.5}
          minHeight={false}
          className="pb-3"
        >
          {filtered.length > 0 ? (
            <ol className="m-0 flex list-none flex-col p-0">
              {filtered.map((post, i) => (
                <li key={post.id} className="border-b border-hairline">
                  <PostRow post={post} index={i + 1} showTags />
                </li>
              ))}
            </ol>
          ) : (
            <p className="mx-3 mt-2 mb-4 text-card text-ink-2">
              {blogPage.emptyLabel}
            </p>
          )}
        </BentoCard>
      </Bento>
    </>
  );
}
