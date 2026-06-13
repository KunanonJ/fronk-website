import Script from "next/script";

// GA4 Measurement IDs look like "G-XXXXXXXXXX". Validating the shape also closes
// any injection surface, since the id is interpolated into the inline gtag init.
const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

/**
 * The GA Measurement ID to load, or null when GA should stay off — missing or
 * malformed id, or not production (keeps localhost / dev out). Pure + testable.
 */
export function resolveGaId(
  gaId: string | undefined,
  nodeEnv: string | undefined,
): string | null {
  if (!gaId || !GA_ID_PATTERN.test(gaId)) return null;
  if (nodeEnv !== "production") return null;
  return gaId;
}

/**
 * The canonical production hostname GA is allowed to record on, derived from
 * NEXT_PUBLIC_SITE_URL — or null for a missing / local / placeholder URL. Used
 * to gate the gtag `config` client-side so a STAGING/preview build (which is
 * also `NODE_ENV=production`) never pollutes the production property even if the
 * GA id leaks into its env. Pure + testable.
 */
export function productionHost(siteUrl: string | undefined): string | null {
  if (!siteUrl) return null;
  try {
    const host = new URL(siteUrl).hostname;
    if (!host || host === "localhost" || host.endsWith(".example.com")) {
      return null;
    }
    return host;
  } catch {
    return null;
  }
}

/**
 * Google Analytics 4 (gtag.js). Loads only when `NEXT_PUBLIC_GA_ID` is a valid
 * id AND `NODE_ENV=production`; the gtag `config` (which actually sends data) is
 * additionally gated to the production hostname so previews/staging can't
 * pollute the property. GA Measurement IDs are public (they ship in the client
 * bundle), so the id lives in an env var purely to stay configurable.
 */
export function GoogleAnalytics() {
  const gaId = resolveGaId(process.env.NEXT_PUBLIC_GA_ID, process.env.NODE_ENV);
  if (!gaId) return null;

  const host = productionHost(process.env.NEXT_PUBLIC_SITE_URL);
  // When we know the production host, only configure GA on it (and its www.
  // variant). With no usable host, fall back to the NODE_ENV gate alone.
  const configGuard = host
    ? `if (location.hostname === ${JSON.stringify(host)} || location.hostname === ${JSON.stringify(`www.${host}`)}) `
    : "";

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${configGuard}gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
