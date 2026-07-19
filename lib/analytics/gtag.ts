declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type GtagParams = Record<
  string,
  string | number | boolean | undefined
>;

/**
 * Send a GA4 event. Safe everywhere: a no-op when `gtag` isn't on the page
 * (development, CI, no GA id, or before the script loads), so callers never need
 * to guard. Use for the site-specific signals GA's Enhanced Measurement can't
 * infer (which venture was clicked, theme preference, real-user Web Vitals).
 */
export function track(event: string, params?: GtagParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params ?? {});
}

/** Named conversion events for SEM / GTM (also push to dataLayer). */
export const ConversionEvents = {
  contactCta: "contact_cta_click",
  ventureOutbound: "venture_outbound_click",
  topicHubCta: "topic_hub_cta",
  newsletterSubscribe: "newsletter_subscribe",
} as const;

export function trackConversion(
  event: (typeof ConversionEvents)[keyof typeof ConversionEvents],
  params?: GtagParams,
): void {
  track(event, params);
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...(params ?? {}) });
}
