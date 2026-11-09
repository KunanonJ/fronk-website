import { Link as RouterLink } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes } from "react";

/*
 * `next/link` on TanStack Router (tanstack-migration). Aliased in
 * vite.config.ts so shared components run under Start unchanged; Phase 6
 * moves them to Router's Link and deletes this file.
 */

type UrlObject = { pathname?: string; query?: Record<string, string>; hash?: string };

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
  const hash = href.hash ? (href.hash.startsWith("#") ? href.hash : `#${href.hash}`) : "";
  return `${href.pathname ?? ""}${query}${hash}`;
}

const Link = forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, prefetch, scroll, replace, shallow: _shallow, legacyBehavior: _legacy, passHref: _pass, locale: _locale, ...rest },
  ref,
) {
  const url = toHref(href);
  // Off-site, protocol and fragment-only links stay plain anchors, as in Next.
  if (!url.startsWith("/") || url.startsWith("//")) {
    return <a ref={ref} href={url} {...rest} />;
  }
  const parsed = new URL(url, "http://local");
  const search = parsed.search ? Object.fromEntries(parsed.searchParams) : undefined;
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
      activeProps={{}}
      {...rest}
    />
  );
});

export default Link;
