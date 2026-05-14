import Script from "next/script";

/**
 * Umami analytics tracker. No-op unless ALL of these are true:
 *
 * 1. `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set
 * 2. We are running in production (so localhost / preview traffic doesn't
 *    pollute the stats)
 *
 * The host defaults to Umami Cloud but can be overridden via
 * `NEXT_PUBLIC_UMAMI_HOST` for self-hosted Umami instances.
 *
 * The `UMAMI_API_KEY` env var is a separate server-only credential used for
 * fetching analytics data via Umami's REST API — it is NOT used here.
 */
export function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const host = process.env.NEXT_PUBLIC_UMAMI_HOST ?? "https://cloud.umami.is";

  if (!websiteId) return null;
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      defer
      strategy="lazyOnload"
      src={`${host}/script.js`}
      data-website-id={websiteId}
      data-host-url={host}
    />
  );
}
