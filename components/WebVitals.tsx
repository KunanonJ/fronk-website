"use client";

import { useReportWebVitals } from "next/web-vitals";
import { track } from "@/lib/analytics/gtag";

/**
 * Reports real-user Core Web Vitals (LCP, INP, CLS, FCP, TTFB) to GA4 as
 * `web_vitals` events — GA does not collect these on its own. Surfaces the
 * performance your actual visitors experience, sliceable by page/device/country
 * in GA. No-op until GA is loaded (the track() helper guards), so it costs
 * nothing in dev/CI.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    track("web_vitals", {
      metric_name: metric.name,
      // CLS is unitless (~0–1); scale ×1000 so GA stores a useful integer.
      metric_value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value,
      ),
      metric_rating: metric.rating,
      metric_id: metric.id,
      page_path:
        typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  });

  return null;
}
