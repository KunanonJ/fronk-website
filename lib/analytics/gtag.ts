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
