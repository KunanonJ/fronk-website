import Script from "next/script";
import { productionHost } from "@/components/GoogleAnalytics";

/** GTM container IDs look like "GTM-XXXXXXX". */
const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/**
 * Resolve GTM container id — production only, valid shape. Pure + testable.
 */
export function resolveGtmId(
  gtmId: string | undefined,
  nodeEnv: string | undefined,
): string | null {
  if (!gtmId || !GTM_ID_PATTERN.test(gtmId)) return null;
  if (nodeEnv !== "production") return null;
  return gtmId;
}

/**
 * Google Tag Manager. Loads only when `NEXT_PUBLIC_GTM_ID` is valid and
 * `NODE_ENV=production`. Host-gated like GA4 so preview builds do not fire.
 * Ads / LinkedIn tags live inside the GTM container UI.
 */
export function GoogleTagManager() {
  const gtmId = resolveGtmId(
    process.env.NEXT_PUBLIC_GTM_ID,
    process.env.NODE_ENV,
  );
  if (!gtmId) return null;

  const host = productionHost(process.env.NEXT_PUBLIC_SITE_URL);
  const hostGuard = host
    ? `if(location.hostname!==${JSON.stringify(host)}&&location.hostname!==${JSON.stringify(`www.${host}`)})return;`
    : "";

  return (
    <>
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){${hostGuard}w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
