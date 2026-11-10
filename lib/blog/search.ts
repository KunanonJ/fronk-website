import * as v from "valibot";

/*
 * /blog route options that run on every navigation (so they ship in the
 * entry bundle): keep this module free of anything but Valibot. The blog
 * content (lib/content/blog) pulls in the Sanity client.
 */

/** The defaults; stripped from the URL, so /blog stays clean. */
export const BLOG_SEARCH_DEFAULTS = { tag: "", q: "" } as const;

/**
 * Free text from the URL. The router parses `?q=2026` as a number, so
 * numbers come back as their text; anything else, or text past 80
 * characters, falls back to empty.
 */
const text = v.optional(
  v.fallback(
    v.pipe(
      v.union([v.string(), v.pipe(v.number(), v.transform(String))]),
      v.maxLength(80),
    ),
    "",
  ),
  "",
);

/**
 * /blog search params (TanStack Router `validateSearch`, Standard Schema):
 * `?tag=` narrows the posts to one tag (tags come from Sanity, so the page
 * ignores one no post carries) and `?q=` searches titles, excerpts and tags.
 */
export const blogSearchSchema = v.object({ tag: text, q: text });
