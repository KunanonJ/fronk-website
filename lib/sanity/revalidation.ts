export const REVALIDATE_TAGS = {
  site: "site",
  home: "home",
  pages: "pages",
  ventures: "ventures",
  resume: "resume",
  posts: "posts",
  writing: "writing",
} as const;

/**
 * How long a cached Sanity response stays fresh, in seconds. Sanity reads
 * must be cacheable for their tags to attach to the page: Next.js only links
 * a fetch's `next.tags` to the page's cache entry when the fetch itself is
 * cached. Before 09-11-26 the reads were uncached, so `revalidateTag` from the
 * webhook and cron matched nothing. 60 s matches `/resume`'s page revalidate,
 * so content still refreshes within a minute even if the webhook is missed.
 */
export type RevalidationTag =
  (typeof REVALIDATE_TAGS)[keyof typeof REVALIDATE_TAGS];

const GLOBAL_TAGS: readonly RevalidationTag[] = [
  REVALIDATE_TAGS.site,
  REVALIDATE_TAGS.home,
  REVALIDATE_TAGS.pages,
  REVALIDATE_TAGS.ventures,
  REVALIDATE_TAGS.resume,
  REVALIDATE_TAGS.posts,
  REVALIDATE_TAGS.writing,
];

const TYPE_TAGS: Record<string, readonly RevalidationTag[]> = {
  author: [REVALIDATE_TAGS.posts],
  homePage: [REVALIDATE_TAGS.home],
  post: [REVALIDATE_TAGS.posts],
  resumeProfile: [REVALIDATE_TAGS.resume],
  siteSettings: GLOBAL_TAGS,
  standardPage: [REVALIDATE_TAGS.pages, REVALIDATE_TAGS.site],
  venture: [REVALIDATE_TAGS.ventures, REVALIDATE_TAGS.home],
  writingPage: [REVALIDATE_TAGS.writing],
};

export function getRevalidationTagsForType(
  type: string | null | undefined,
): readonly RevalidationTag[] {
  if (!type) return GLOBAL_TAGS;
  return TYPE_TAGS[type] ?? GLOBAL_TAGS;
}
