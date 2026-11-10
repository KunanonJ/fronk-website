import { useEffect, useRef } from "react";
import type { Metric } from "web-vitals";

/**
 * Report each Core Web Vital once per page load. `web-vitals` is imported
 * after hydration and only when `enabled`, so it never sits in a page's
 * first-load JS and costs nothing while no analytics is configured.
 */
export function useReportWebVitals(
  callback: (metric: Metric) => void,
  enabled = true,
): void {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void import("web-vitals").then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      if (cancelled) return;
      const report = (metric: Metric) => ref.current(metric);
      onCLS(report);
      onFCP(report);
      onINP(report);
      onLCP(report);
      onTTFB(report);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);
}
