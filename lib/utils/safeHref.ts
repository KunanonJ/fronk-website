/** Schemes a link from content may use. */
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * The link as given when it is safe to put in an href: a path, a fragment,
 * or an http(s), mailto or tel URL. Anything else (data:, vbscript:, file:,
 * or an OS protocol handler such as search-ms:) gives undefined, for the
 * caller to render without a link. CMS fields reach these hrefs, so a
 * compromised editor account must not be able to plant one. React blocks
 * javascript: by itself, but no other scheme.
 *
 * The URL parser decides the scheme, so tabs, newlines and leading control
 * characters hidden inside it are read the way a browser reads them.
 */
export function safeHref(href: string): string | undefined {
  try {
    const { protocol } = new URL(href, "https://base.invalid/");
    return SAFE_PROTOCOLS.has(protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}
