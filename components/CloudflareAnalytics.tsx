import Script from "next/script";

export function resolveCloudflareAnalyticsToken(
  token: string | undefined,
  nodeEnv: string | undefined,
): string | null {
  const trimmed = token?.trim();
  if (!trimmed) return null;
  if (nodeEnv !== "production") return null;
  return trimmed;
}

export function CloudflareAnalytics() {
  const token = resolveCloudflareAnalyticsToken(
    process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN,
    process.env.NODE_ENV,
  );

  if (!token) return null;

  return (
    <Script
      defer
      strategy="lazyOnload"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
