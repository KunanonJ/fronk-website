"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

interface ParsedMetric {
  prefix: string;
  target: number;
  suffix: string;
  /** Whether the source used thousands grouping (so we re-apply it). */
  grouped: boolean;
}

/**
 * Split a metric string into its prefix, numeric core, and suffix. Returns null
 * when there is no animatable number (e.g. "Acquired") so the caller renders it
 * verbatim — never a fabricated or reformatted figure.
 */
export function parseMetric(value: string): ParsedMetric | null {
  const match = value.match(/^(\D*)(\d[\d,]*)(\D*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  return { prefix, target, suffix, grouped: digits.includes(",") };
}

/**
 * Render a number back into the metric's display form, re-applying thousands
 * grouping when the source used it — so the animation's final frame equals the
 * input string exactly.
 */
export function formatCount(n: number, parsed: ParsedMetric): string {
  const core = parsed.grouped ? n.toLocaleString("en-US") : String(n);
  return `${parsed.prefix}${core}${parsed.suffix}`;
}

const DURATION_MS = 1100;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface MetricCountUpProps {
  value: string;
  className?: string;
}

/**
 * Counts a metric up from zero to its real value when it scrolls into view — the
 * home page's one indulgent flourish, in keeping with instruments spinning up.
 * The final value is the source of truth: server-rendered and shown verbatim for
 * crawlers, no-JS, and reduced-motion users, so there is never a layout shift or
 * a fabricated figure. The count runs only after mount + first intersection, on
 * requestAnimationFrame, and is cancelled on unmount.
 */
export function MetricCountUp({ value, className }: MetricCountUpProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  // Source of truth from the very first paint → no flash, no CLS.
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduced) return;
    const parsed = parseMetric(value);
    if (!parsed) return;
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let startTs = 0;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / DURATION_MS, 1);
      const current = Math.round(parsed.target * easeOutCubic(progress));
      setDisplay(formatCount(current, parsed));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, reduced]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
