import { useEffect } from "react";
import {
  ConversionEvents,
  track,
  type ConversionEvent,
} from "@/lib/analytics/track";

const EVENT_MAP: Record<string, ConversionEvent> = {
  contact_cta_click: ConversionEvents.contactCta,
  venture_outbound_click: ConversionEvents.ventureOutbound,
  topic_hub_cta: ConversionEvents.topicHubCta,
};

/**
 * Delegates clicks on `[data-analytics]` CTAs to Umami conversion events.
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
      track(EVENT_MAP[name]!, {
        topic_slug: el.dataset.topicSlug,
        venture: el.dataset.venture,
      });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
