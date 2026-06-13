/** Restrict draft-mode redirects to same-site relative paths. */
export function getSafeRedirectPath(slug: string | null | undefined): string {
  if (!slug) return "/";

  const trimmed = slug.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return "/";
  }

  return trimmed;
}
