/**
 * Google Search Console HTML-tag verification token.
 * Tokens are alphanumeric (sometimes with underscores/hyphens). Reject anything
 * that could break out of a meta content attribute.
 */
const GSC_TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export function resolveGscVerification(
  token: string | undefined,
): string | null {
  if (!token || !GSC_TOKEN_PATTERN.test(token)) return null;
  return token;
}
