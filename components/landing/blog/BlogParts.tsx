import Link from "@/components/navigation/Link";
import Image from "@/components/ui/Image";
import { formatBlogDate, type BlogCard } from "@/lib/content/blog";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";

/*
 * Pieces shared by the blog index and a post (profile redesign Phase 7h, a
 * light restyle of the bento canvas Blog and Post). Hidden while BLOG_PUBLIC
 * is false. Styles: `.pf-blog*` in src/styles/profile/pages-catalog.css.
 */

/** Body links: the prose link, underlined (axe link-in-text-block). */
export const BODY_LINK = "ds-prose-link";

/**
 * A post banner in a mat (tint, 20 px radius). The banners stay the current
 * images until the owner supplies new ones.
 */
export function BannerFigure({
  post,
  priority = false,
  sizes,
  className,
}: {
  post: Pick<BlogCard, "bannerSrc" | "bannerAlt">;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  return (
    <figure className={cn("pf-blog-banner", className)}>
      <Image
        src={post.bannerSrc}
        alt={post.bannerAlt}
        fill
        priority={priority}
        sizes={sizes}
      />
    </figure>
  );
}

/**
 * One post as a row (Posts list, More on this tag): the date column, then
 * title, excerpt and an optional tag line with "Read →". The title is the
 * row's one link, named by the title alone, and its ::after (`.ds-stretch`)
 * covers the row, so the whole row still opens the post.
 */
export function PostRow({
  post,
  index,
  showTags = false,
}: {
  post: BlogCard;
  /** Two-digit position above the date (the index list only). */
  index?: number;
  showTags?: boolean;
}) {
  const read = (
    <span aria-hidden className="pf-blog-row__read">
      Read <span className="pf-blog-row__arrow">→</span>
    </span>
  );
  return (
    <div className="pf-blog-row">
      <div className="pf-blog-row__when">
        {index !== undefined ? (
          <span className="t-meta pf-cat-note">{pad2(index)}</span>
        ) : null}
        <time
          dateTime={post.publishedAt.slice(0, 10)}
          className="t-meta pf-blog-row__date"
        >
          {formatBlogDate(post.publishedAt)}
        </time>
      </div>
      <div className="pf-blog-row__copy">
        <h3 className="t-lift-title pf-cat-title">
          <Link
            href={`/blog/${post.slug}`}
            className="ds-stretch pf-blog-row__link"
          >
            {post.title}
          </Link>
        </h3>
        <p className="t-small pf-cat-note">{post.excerpt}</p>
        {showTags ? (
          <div className="pf-blog-row__foot">
            <span className="t-meta pf-cat-note">{post.tags.join(" · ")}</span>
            {read}
          </div>
        ) : (
          read
        )}
      </div>
    </div>
  );
}
