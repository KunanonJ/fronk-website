"use client";

import { useEffect } from "react";
import { ConversionEvents, trackConversion } from "@/lib/analytics/gtag";

const EVENT_MAP: Record<string, (typeof ConversionEvents)[keyof typeof ConversionEvents]> =
  {
    contact_cta_click: ConversionEvents.contactCta,
    venture_outbound_click: ConversionEvents.ventureOutbound,
    topic_hub_cta: ConversionEvents.topicHubCta,
  };

/**
 * Delegates clicks on `[data-analytics]` CTAs to GA4/GTM conversion events.
 * Mount once on discovery hub pages.
 */
export function DiscoveryAnalytics() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>("[data-analytics]");
      if (!el) return;
      const name = el.dataset.analytics;
      if (!name || !(name in EVENT_MAP)) return;
      trackConversion(EVENT_MAP[name]!, {
        topic_slug: el.dataset.topicSlug,
        venture: el.dataset.venture,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
