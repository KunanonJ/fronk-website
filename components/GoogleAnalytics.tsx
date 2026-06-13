import Script from "next/script";

// GA4 Measurement IDs look like "G-XXXXXXXXXX". Validating the shape also closes
// any injection surface, since the id is interpolated into the inline gtag init.
const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

/**
 * The GA Measurement ID to load, or null when GA should stay off — missing or
 * malformed id, or not production (keeps localhost / preview / CI out of stats).
 * Pure + testable.
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
 * Google Analytics 4 (gtag.js). No-op unless `NEXT_PUBLIC_GA_ID` is a valid GA
 * id AND we are in production. GA Measurement IDs are public (they ship in the
 * client bundle), so the id lives in an env var purely to stay configurable per
 * environment — set it in the deploy env (it is inlined at build time).
 */
export function GoogleAnalytics() {
  const gaId = resolveGaId(
    process.env.NEXT_PUBLIC_GA_ID,
    process.env.NODE_ENV,
  );
  if (!gaId) return null;

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
gtag('config', '${gaId}');`}
      </Script>
    </>
  );
}
