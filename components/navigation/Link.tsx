import { Link as RouterLink } from "@tanstack/react-router";
import { forwardRef, type AnchorHTMLAttributes } from "react";

import { safeHref } from "@/lib/utils/safeHref";

/*
 * The site's Link: TanStack Router's Link for the site's pages, from a plain
 * href string. Off-site links, files (llms.txt, resume.pdf), API routes and
 * the Studio are plain anchors: the router would try to render them as pages.
 */

/** Paths a full page load must handle: a file extension, /api or /studio. */
const DOCUMENT_PATH = /(\.[a-z0-9]+$)|(^\/(api|studio)(\/|$))/i;

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href: url, ...rest },
  ref,
) {
  // Off-site, protocol and fragment-only links stay plain anchors, as in Next.
  // Checked before parsing: a malformed CMS URL must not throw during render.
  // A scheme outside http(s), mailto and tel loses its href (safeHref).
  if (!url.startsWith("/") || url.startsWith("//")) {
    return <a ref={ref} href={safeHref(url)} {...rest} />;
  }
  let parsed: URL;
  try {
    parsed = new URL(url, "http://local");
  } catch {
    return <a ref={ref} href={url} {...rest} />;
  }
  if (DOCUMENT_PATH.test(parsed.pathname)) {
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
      preload="intent"
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
