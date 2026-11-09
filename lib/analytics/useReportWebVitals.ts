import { useEffect, useRef } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";

/* `next/web-vitals` on the web-vitals package (tanstack-migration). */
export function useReportWebVitals(callback: (metric: Metric) => void): void {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  }, [callback]);
  useEffect(() => {
    const report = (metric: Metric) => ref.current(metric);
    onCLS(report);
    onFCP(report);
    onINP(report);
    onLCP(report);
    onTTFB(report);
  }, []);
}
