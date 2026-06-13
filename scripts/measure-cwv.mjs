#!/usr/bin/env node
/**
 * Core Web Vitals spot-check (LCP + CLS) against a running server, via a headless
 * Chromium PerformanceObserver. INP needs real interaction and isn't measured
 * here — run Lighthouse in CI for the full field/lab picture; this is a fast
 * regression guard that the static-SSR-headline LCP and transform/opacity-only
 * motion (no layout shift) hold.
 *
 * Usage:  next start &   then   BASE_URL=http://localhost:3000 node scripts/measure-cwv.mjs
 * Targets: LCP < 2500ms, CLS < 0.1.
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const ROUTES = ["/", "/ventures", "/resume", "/writing", "/about"];

async function measure(page, path) {
  await page.goto(BASE + path, { waitUntil: "load" });
  // Settle LCP, then scroll to trigger reveals/below-fold content and capture
  // any layout shift they cause (should be ~0 — reveal is transform+opacity).
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await wait(500);
    window.scrollTo(0, document.body.scrollHeight);
    await wait(900);
    window.scrollTo(0, 0);
    await wait(300);
  });
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        let cls = 0;
        let lcp = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) cls += e.value;
          }
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          lcp = entries[entries.length - 1].startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve({ lcp, cls }), 400);
      }),
  );
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
console.log(
  "Route".padEnd(12),
  "LCP(ms)".padStart(9),
  "CLS".padStart(8),
  "  verdict (LCP<2500 · CLS<0.1)",
);
let allOk = true;
for (const path of ROUTES) {
  const { lcp, cls } = await measure(page, path);
  const lcpOk = lcp < 2500;
  const clsOk = cls < 0.1;
  if (!lcpOk || !clsOk) allOk = false;
  console.log(
    path.padEnd(12),
    lcp.toFixed(0).padStart(9),
    cls.toFixed(3).padStart(8),
    `  ${lcpOk ? "LCP ✅" : "LCP ❌"}  ${clsOk ? "CLS ✅" : "CLS ❌"}`,
  );
}
await browser.close();
console.log("\n" + (allOk ? "CWV PASS (localhost prod build)" : "CWV FAIL"));
process.exit(allOk ? 0 : 1);
