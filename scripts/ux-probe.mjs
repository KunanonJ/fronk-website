#!/usr/bin/env node
/**
 * UX probe (visual-redesign Phase 0): the ux-audit and Phase 1 probe as a
 * repeatable tool. Loads each route in system Chrome on a throttled phone
 * profile with a cold cache and prints LCP, CLS, TBT, bytes by type, font
 * requests, text under 12 px and tap targets under 24 px (WCAG 2.5.8:
 * visually hidden controls and links inside a sentence are exempt).
 *
 *   pnpm probe                       # default routes against the local preview
 *   BASE=https://kunanonj.com pnpm probe / /about
 *
 * Profile: 390x844, DPR 2, touch, 4x CPU, ~1.6 Mbps down, 150 ms RTT. One run
 * per route: treat numbers as lab indicators, and compare before/after runs
 * made the same way.
 */
import { chromium } from "@playwright/test";

const BASE = (process.env.BASE ?? "http://127.0.0.1:4173").replace(/\/$/, "");
const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/about", "/contact", "/portfolio"];

const PHONE = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

async function probe(browser, route) {
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  // Skip the first-visit intro so it doesn't hide the hero from LCP.
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("fronk-intro-seen", "1");
    } catch {
      // storage blocked: the intro may show, which only affects this probe
    }
    window.__ux = { lcp: 0, lcpEl: "", cls: 0, tbt: 0 };
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        window.__ux.lcp = e.startTime;
        const el = e.element;
        window.__ux.lcpEl = el ? `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}` : e.url || "";
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__ux.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) window.__ux.tbt += Math.max(0, e.duration - 50);
    }).observe({ type: "longtask", buffered: true });
  });

  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  const response = await page.goto(BASE + route, { waitUntil: "load", timeout: 120_000 });
  await page.waitForTimeout(3000);

  const result = await page.evaluate(() => {
    const bytes = {};
    let fonts = 0;
    for (const r of performance.getEntriesByType("resource")) {
      // Classify by file type, not initiator: next/font preloads fonts via <link>.
      const path = r.name.split("?")[0];
      const type = /\.(woff2?|ttf|otf)$/.test(path)
        ? "font"
        : /\.css$/.test(path)
          ? "css"
          : /\.m?js$/.test(path)
            ? "script"
            : r.initiatorType === "img" || /\.(avif|webp|png|jpe?g|gif|svg)$/.test(path)
              ? "img"
              : r.initiatorType;
      if (type === "font") fonts += 1;
      bytes[type] = (bytes[type] ?? 0) + (r.transferSize || 0);
    }
    const nav = performance.getEntriesByType("navigation")[0];
    bytes.document = nav ? nav.transferSize : 0;

    let smallText = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    while (walker.nextNode()) {
      const el = walker.currentNode.parentElement;
      if (!el || seen.has(el) || !walker.currentNode.textContent?.trim()) continue;
      seen.add(el);
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      if (el.getClientRects().length === 0) continue;
      if (parseFloat(style.fontSize) < 12) smallText += 1;
    }

    // WCAG 2.5.8 (target size, minimum) with its two exceptions that apply
    // here: visually hidden controls (sr-only inputs whose <label> is the real
    // target, the skip link at rest) and inline links inside a sentence.
    let smallTargets = 0;
    for (const el of document.querySelectorAll("a[href], button, [role='button'], input, select, textarea")) {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue;
      const style = getComputedStyle(el);
      // Inline exception: the link sits in running text of its block.
      let block = el.parentElement;
      while (block && getComputedStyle(block).display.startsWith("inline")) block = block.parentElement;
      const blockText = block?.textContent?.trim() ?? "";
      const ownText = el.textContent?.trim() ?? "";
      if (style.display === "inline" && blockText.length > ownText.length) continue;
      if (rect.width < 24 || rect.height < 24) smallTargets += 1;
    }

    return { ...window.__ux, bytes, fonts, smallText, smallTargets };
  });

  await context.close();
  return { route, status: response?.status() ?? 0, ...result };
}

const kb = (n) => `${(n / 1024).toFixed(0)}`;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const rows = [];
try {
  for (const route of ROUTES) rows.push(await probe(browser, route));
} finally {
  await browser.close();
}

console.log(`UX probe: ${BASE} (390x844, 4x CPU, ~1.6 Mbps, 150 ms RTT, cold cache)\n`);
console.log(
  ["route", "status", "LCP ms", "LCP el", "CLS", "TBT ms", "JS KB", "CSS KB", "img KB", "fonts", "<12px", "<24px"].join("\t"),
);
for (const r of rows) {
  console.log(
    [
      r.route,
      r.status,
      Math.round(r.lcp),
      r.lcpEl.slice(0, 40),
      r.cls.toFixed(3),
      Math.round(r.tbt),
      kb(r.bytes.script ?? 0),
      kb(r.bytes.css ?? 0),
      kb(r.bytes.img ?? 0),
      `${r.fonts} (${kb(r.bytes.font ?? 0)} KB)`,
      r.smallText,
      r.smallTargets,
    ].join("\t"),
  );
}
if (process.env.JSON) console.log(JSON.stringify(rows, null, 2));
