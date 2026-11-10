/**
 * Product analytics events through Umami (the one tool kept next to
 * Cloudflare Web Analytics, owner decision 10-11-26). Safe everywhere: a
 * no-op until the Umami tracker is on the page (no website ID configured,
 * development, CI, or before the script loads). Core Web Vitals come from
 * Cloudflare Web Analytics.
 */
declare global {
  interface Window {
    umami?: {
      track: (
        event: string,
        data?: Record<string, string | number | boolean>,
      ) => void;
    };
  }
}

export type TrackData = Record<string, string | number | boolean | undefined>;

export function track(event: string, data?: TrackData): void {
  if (typeof window === "undefined" || !window.umami) return;
  const defined = Object.fromEntries(
    Object.entries(data ?? {}).filter(([, value]) => value !== undefined),
  ) as Record<string, string | number | boolean>;
  window.umami.track(event, defined);
}

/** Named conversion events for the discovery hubs' CTAs. */
export const ConversionEvents = {
  contactCta: "contact_cta_click",
  ventureOutbound: "venture_outbound_click",
  topicHubCta: "topic_hub_cta",
} as const;

export type ConversionEvent =
  (typeof ConversionEvents)[keyof typeof ConversionEvents];
