/**
 * Railway cron helper — calls /api/cron/revalidate and exits.
 *
 * Use on a separate Railway service (not the web app):
 *   Start command: node scripts/cron-revalidate.mjs
 *   Cron schedule: 0 * * * *   (hourly, UTC)
 *
 * Required env:
 *   CRON_SECRET — same value as on the web service
 *   CRON_ENDPOINT_URL — e.g. https://your-app.up.railway.app/api/cron/revalidate
 *     (falls back to NEXT_PUBLIC_SITE_URL + /api/cron/revalidate)
 */

const secret = process.env.CRON_SECRET;
const endpoint =
  process.env.CRON_ENDPOINT_URL ??
  (process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/api/cron/revalidate`
    : null);

if (!secret) {
  console.error("cron-revalidate: missing CRON_SECRET");
  process.exit(1);
}

if (!endpoint) {
  console.error(
    "cron-revalidate: set CRON_ENDPOINT_URL or NEXT_PUBLIC_SITE_URL",
  );
  process.exit(1);
}

const res = await fetch(endpoint, {
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await res.text();

if (!res.ok) {
  console.error(`cron-revalidate: ${res.status} ${body}`);
  process.exit(1);
}

console.log(`cron-revalidate: ${res.status} ${body}`);
