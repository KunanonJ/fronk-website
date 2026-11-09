import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the Workers caching setup fixed on 09-11-26. Without a real queue and
 * tag cache, OpenNext falls back to "dummy" overrides: ISR pages never
 * re-render and revalidateTag (Sanity webhook, hourly cron) does nothing.
 * See the comments in open-next.config.ts and wrangler.jsonc.
 */
const root = process.cwd();
const openNextConfig = readFileSync(join(root, "open-next.config.ts"), "utf8");
const wrangler = readFileSync(join(root, "wrangler.jsonc"), "utf8");

describe("OpenNext caching config", () => {
  it("uses the Durable Object queue and tag cache, not the dummy defaults", () => {
    expect(openNextConfig).toMatch(/overrides\/queue\/do-queue/);
    expect(openNextConfig).toMatch(/overrides\/tag-cache\/do-sharded-tag-cache/);
    expect(openNextConfig).toMatch(/queue:\s*doQueue/);
    expect(openNextConfig).toMatch(/tagCache:/);
  });

  it("binds and migrates both Durable Object classes in wrangler.jsonc", () => {
    expect(wrangler).toMatch(/"name":\s*"NEXT_CACHE_DO_QUEUE",\s*"class_name":\s*"DOQueueHandler"/);
    expect(wrangler).toMatch(
      /"name":\s*"NEXT_TAG_CACHE_DO_SHARDED",\s*"class_name":\s*"DOShardedTagCache"/,
    );
    expect(wrangler).toMatch(/"new_sqlite_classes":\s*\[\s*"DOQueueHandler",\s*"DOShardedTagCache"\s*\]/);
    expect(wrangler).toMatch(/"binding":\s*"WORKER_SELF_REFERENCE"/);
  });

  it("keeps the two deliberate workarounds", () => {
    expect(wrangler).toMatch(/"NEXT_CACHE_DO_QUEUE_DISABLE_SQLITE":\s*"true"/);
    expect(wrangler).toMatch(/"keep_names":\s*false/);
  });
});
