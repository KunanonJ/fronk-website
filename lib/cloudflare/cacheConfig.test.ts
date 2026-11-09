import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the production Worker config after the TanStack Start cutover
 * (tanstack-migration Phase 5). Without `cache.enabled` the Cache-Tag purge
 * does nothing; without the cron there is no safety net for missed Sanity
 * webhooks; without the legacy Durable Object classes a dashboard rollback to
 * the Next version breaks. See the comments in wrangler.jsonc and src/server.ts.
 */
const root = process.cwd();
const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");
const server = readFileSync(join(root, "src/server.ts"), "utf8");

describe("production Worker config (TanStack Start)", () => {
  it("runs the Start entry with the Worker cache and the hourly purge", () => {
    expect(wrangler).toMatch(/"name":\s*"fronk-website"/);
    expect(wrangler).toMatch(/"main":\s*"src\/server.ts"/);
    expect(wrangler).toMatch(/"cache":\s*\{\s*"enabled":\s*true\s*\}/);
    expect(wrangler).toMatch(/"crons":\s*\[\s*"0 \* \* \* \*"\s*\]/);
  });

  it("rate-limits the forms and routes trailing slashes through the Worker", () => {
    expect(wrangler).toMatch(/"name":\s*"FORM_RATE_LIMIT"/);
    expect(wrangler).toMatch(/"run_worker_first":\s*\[\s*"\/\*\/"\s*\]/);
  });

  it("keeps OpenNext's Durable Object classes bound and exported for rollback", () => {
    expect(wrangler).toMatch(/"class_name":\s*"DOQueueHandler"/);
    expect(wrangler).toMatch(/"class_name":\s*"DOShardedTagCache"/);
    expect(wrangler).toMatch(/"new_sqlite_classes":\s*\[\s*"DOQueueHandler",\s*"DOShardedTagCache"\s*\]/);
    expect(server).toMatch(/export class DOQueueHandler extends DurableObject/);
    expect(server).toMatch(/export class DOShardedTagCache extends DurableObject/);
  });
});
