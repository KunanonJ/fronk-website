export function resolveExternalStudioUrl(
  value = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
): string | null {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
}
