import { Link as RouterLink } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes } from "react";

/*
 * The site's Link: TanStack Router's Link behind the `next/link` props the
 * components were written against. Off-site links, files (llms.txt,
 * resume.pdf), API routes and the Studio are plain anchors: the router would
 * try to render them as pages.
 */

/** Paths a full page load must handle: a file extension, /api or /studio. */
const DOCUMENT_PATH = /(\.[a-z0-9]+$)|(^\/(api|studio)(\/|$))/i;

type UrlObject = {
  pathname?: string;
  query?: Record<string, string>;
  hash?: string;
};

type NextLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string | UrlObject;
  prefetch?: boolean | null;
  scroll?: boolean;
  replace?: boolean;
  shallow?: boolean;
  legacyBehavior?: boolean;
  passHref?: boolean;
  locale?: string | false;
};

function toHref(href: string | UrlObject): string {
  if (typeof href === "string") return href;
  const query = href.query ? `?${new URLSearchParams(href.query)}` : "";
  const hash = href.hash
    ? href.hash.startsWith("#")
      ? href.hash
      : `#${href.hash}`
    : "";
  return `${href.pathname ?? ""}${query}${hash}`;
}

const Link = forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  {
    href,
    prefetch,
    scroll,
    replace,
    shallow: _shallow,
    legacyBehavior: _legacy,
    passHref: _pass,
    locale: _locale,
    ...rest
  },
  ref,
) {
  const url = toHref(href);
  const parsed = new URL(url, "http://local");
  // Off-site, protocol and fragment-only links stay plain anchors, as in Next.
  if (
    !url.startsWith("/") ||
    url.startsWith("//") ||
    DOCUMENT_PATH.test(parsed.pathname)
  ) {
    return <a ref={ref} href={url} {...rest} />;
  }
  const search = parsed.search
    ? Object.fromEntries(parsed.searchParams)
    : undefined;
  return (
    <RouterLink
      ref={ref}
      // Paths come from content, not the typed route tree.
      to={parsed.pathname as never}
      search={search as never}
      hash={parsed.hash ? parsed.hash.slice(1) : undefined}
      resetScroll={scroll === false ? false : undefined}
      replace={replace}
      preload={prefetch === false ? false : "intent"}
      // Only the exact page counts as current (aria-current="page"); hash
      // links like /#ventures never do.
      activeOptions={{
        exact: true,
        includeSearch: false,
        includeHash: Boolean(parsed.hash),
      }}
      activeProps={{}}
      {...rest}
    />
  );
});

export default Link;
