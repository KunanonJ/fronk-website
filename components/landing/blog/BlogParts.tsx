import Link from "@/components/navigation/Link";
import Image from "@/components/ui/Image";
import { formatBlogDate, type BlogCard } from "@/lib/content/blog";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";
import { MONO_LABEL } from "@/components/bento/classes";

/*
 * Pieces shared by the bento Blog index and Post (design spec 4.17-4.18).
 */

/** Body links: the link colour, underlined, as in the canvas post body. */
export const BODY_LINK =
  "text-link underline decoration-1 underline-offset-4 [overflow-wrap:anywhere] hover:text-ink";

/**
 * A post banner in the canvas figure frame (tint well, 20 px radius). The
 * banners stay the current images until the owner supplies new ones (spec
 * 6, gap 12).
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
    <figure
      className={cn(
        "relative m-0 overflow-hidden rounded-well border border-hairline bg-surface-tint",
        className,
      )}
    >
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
 * One post as a whole-row link (Posts list, More on this tag): the date
 * column, then title, excerpt and an optional tag line with "Read →".
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
  const date = (
    <time
      dateTime={post.publishedAt.slice(0, 10)}
      className={cn(
        "font-mono text-meta",
        index === undefined ? "text-ink-2" : "text-ink",
      )}
    >
      {formatBlogDate(post.publishedAt)}
    </time>
  );
  const read = (
    <span aria-hidden className="text-sm font-medium text-link">
      Read →
    </span>
  );
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "kj-row flex flex-wrap items-start gap-x-6 gap-y-1.5 rounded-[18px] px-3 text-ink no-underline",
        index === undefined ? "py-4" : "py-[18px]",
      )}
    >
      <div className="flex flex-[0_0_104px] flex-col gap-0.5 pt-1">
        {index !== undefined ? (
          <span className="font-mono text-xs text-ink-2">{pad2(index)}</span>
        ) : null}
        {date}
      </div>
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5">
        <h3
          className={cn(
            "m-0 leading-[1.3] font-semibold tracking-[-0.015em]",
            index === undefined ? "text-lg" : "text-[19px]",
          )}
        >
          {post.title}
        </h3>
        <p className="m-0 max-w-[620px] text-card leading-[1.55] text-ink-2">
          {post.excerpt}
        </p>
        {showTags ? (
          <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <span className={MONO_LABEL}>{post.tags.join(" · ")}</span>
            {read}
          </div>
        ) : (
          read
        )}
      </div>
    </Link>
  );
}

/** The 14 px back arrow before "Back to Blog". */
export function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
