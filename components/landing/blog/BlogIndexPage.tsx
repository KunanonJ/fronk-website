import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { TextLink } from "@/components/ds/TextLink";
import Link from "@/components/navigation/Link";
import { BannerFigure, PostRow } from "@/components/landing/blog/BlogParts";
import { CatalogHero } from "@/components/profile/catalog/CatalogHero";
import { ToggleGroup } from "@/components/profile/catalog/ToggleGroup";
import { Headline } from "@/components/profile/pages/PageHero";
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
 * /blog (profile redesign Phase 7h, a light restyle of the bento canvas
 * Blog). Hidden while BLOG_PUBLIC is false: noindex, and no public page links
 * here. Posts come from Sanity merged with the cornerstone fallbacks (the
 * route's loader). The hero on the pixel sky, then tiles. Styles: `.pf-blog*`
 * in src/styles/profile/pages-catalog.css.
 */

/** A tile named by its mono heading; `span` places it in the grid. */
function BlogTile({
  id,
  title,
  span = 1,
  className,
  children,
}: {
  id: string;
  title: string;
  span?: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      aria-labelledby={id}
      data-span={span}
      className={cn("ds-tile pf-blog-tile", className)}
    >
      <h2 id={id} className="t-meta pf-cat-kicker">
        {title}
      </h2>
      {children}
    </article>
  );
}

function BlogHero({ eyebrow }: { eyebrow: string }) {
  return (
    <CatalogHero
      eyebrow={eyebrow}
      title={<Headline lines={blogPage.headline} />}
      lead={blogPage.lead}
    />
  );
}

function CornerstoneCard({ post }: { post: BlogCard }) {
  return (
    <BlogTile
      id="card-featured"
      title="Cornerstone"
      span={2}
      className="pf-blog-feature"
    >
      <div className="pf-blog-feature__body">
        <BannerFigure
          post={post}
          sizes="(min-width: 1024px) 320px, 100vw"
          className="pf-blog-feature__banner"
        />
        <div className="pf-blog-feature__copy">
          <p className="t-meta pf-cat-note pf-blog-feature__meta">
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
          <h3 className="t-h3 pf-cat-title">{post.title}</h3>
          <p className="t-small pf-cat-note">{post.excerpt}</p>
          <Link href={`/blog/${post.slug}`} className="ds-text-link">
            Read<span className="sr-only">: {post.title}</span>&nbsp;→
          </Link>
        </div>
      </div>
    </BlogTile>
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
    <BlogTile id="card-archive" title="Archive">
      <dl className="pf-blog-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="pf-blog-stats__item">
            <dt className="t-meta pf-cat-note">{stat.label}</dt>
            <dd className="t-title pf-cat-title">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <dl className="pf-blog-dates">
        {dates.map(({ label, post }) =>
          post ? (
            <div key={label} className="pf-blog-dates__row">
              <dt className="t-meta pf-cat-note">{label}</dt>
              <dd className="pf-cat-code">
                <time dateTime={post.publishedAt.slice(0, 10)}>
                  {formatBlogDate(post.publishedAt)}
                </time>
              </dd>
            </div>
          ) : null,
        )}
      </dl>
    </BlogTile>
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
    <BlogTile id="card-ventures" title="In these notes">
      <div
        role="group"
        aria-label="Filter by venture"
        className="pf-blog-ventures"
      >
        {rows.map((row) => {
          const on = active === row.name;
          return (
            <button
              key={row.name}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(on ? "" : row.name)}
              className="pf-blog-venture"
            >
              <img
                src={row.logo}
                alt=""
                width={44}
                height={44}
                className="pf-blog-venture__logo"
              />
              <span className="pf-blog-venture__copy">
                <span className="pf-blog-venture__name">{row.name}</span>
                <span className="t-small pf-cat-note">
                  {row.count} {row.count === 1 ? "post" : "posts"} tagged{" "}
                  {row.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="pf-blog-tile__end">
        <TextLink href="/#ventures">Ventures</TextLink>
      </div>
    </BlogTile>
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
    <BlogTile id="card-find" title="Search or filter" span={2}>
      <div className="pf-cat-stack">
        <label htmlFor="blog-search" className="t-small pf-cat-note">
          {blogPage.searchLabel}
        </label>
        <div className="pf-blog-search">
          <Search
            aria-hidden
            size={16}
            strokeWidth={1.8}
            className="pf-blog-search__icon"
          />
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={blogPage.searchPlaceholder}
            autoComplete="off"
            className="pf-blog-search__input"
          />
        </div>
      </div>
      {/* A tag is a toggle: picking the pressed one again clears it. */}
      <ToggleGroup
        label="Filter by tag"
        value={active ?? ""}
        onChange={(tag) => onPick(tag === active ? "" : tag)}
        options={[
          { value: "", label: blogPage.allTagsLabel, count: total },
          ...tags.map((tag) => ({
            value: tag,
            label: tag,
            count: counts.get(tag) ?? 0,
          })),
        ]}
      />
      <p aria-live="polite" className="t-meta pf-cat-note pf-blog-result">
        <span aria-hidden className="pf-skill-tag__mark" />
        Showing {shown} of {total} posts{active ? ` tagged ${active}` : ""}
      </p>
    </BlogTile>
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
      <div className="ds-wrap pf-cat-section pf-cat-end">
        <div className="pf-blog-grid">
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
          <BlogTile id="card-posts" title="Posts" span={3}>
            {filtered.length > 0 ? (
              <ol className="pf-blog-list">
                {filtered.map((post, i) => (
                  <li key={post.id} className="pf-blog-list__item">
                    <PostRow post={post} index={i + 1} showTags />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="t-small pf-cat-note">{blogPage.emptyLabel}</p>
            )}
          </BlogTile>
        </div>
      </div>
    </>
  );
}
