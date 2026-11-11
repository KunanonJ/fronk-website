import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseJsonc } from "@/scripts/wrangler-vars.mjs";

/**
 * Guards the Worker configs. Without `cache.enabled` there is no edge cache
 * and the Cache-Tag purge does nothing. The cron list is empty on purpose:
 * the hourly purge was not seen to work, and a cached copy now ends within
 * the hour by its lifetime (src/lib/cache.ts). An empty list, not a missing
 * key: a deploy leaves the deployed triggers in place when the key is
 * missing. The old Next.js build's Durable Object classes are gone, and
 * migrations are append-only. See wrangler.jsonc and src/server.ts.
 */
type WranglerConfig = {
  name: string;
  main: string;
  cache?: { enabled?: boolean };
  triggers?: { crons?: string[] };
  ratelimits?: { name: string }[];
  assets?: { run_worker_first?: string[] };
  durable_objects?: { bindings?: { class_name: string }[] };
  migrations?: {
    tag: string;
    new_sqlite_classes?: string[];
    deleted_classes?: string[];
  }[];
};

const root = process.cwd();
const read = (file: string) =>
  parseJsonc(readFileSync(join(root, file), "utf8")) as WranglerConfig;
const wrangler = read("wrangler.jsonc");
const staging = read("wrangler.start.jsonc");
const server = readFileSync(join(root, "src/server.ts"), "utf8");

describe("production Worker config (TanStack Start)", () => {
  it("runs the Start entry with the Worker cache and no cron trigger", () => {
    expect(wrangler.name).toBe("fronk-website");
    expect(wrangler.main).toBe("src/server.ts");
    expect(wrangler.cache?.enabled).toBe(true);
    expect(wrangler.triggers).toEqual({ crons: [] });
    expect(server).not.toMatch(/\bscheduled\s*\(/);
  });

  it("gives the staging Worker the same entry, cache and empty cron list", () => {
    expect(staging.main).toBe("src/server.ts");
    expect(staging.cache?.enabled).toBe(true);
    expect(staging.triggers).toEqual({ crons: [] });
  });

  it("rate-limits the forms and routes trailing slashes through the Worker", () => {
    expect(wrangler.ratelimits?.map((r) => r.name)).toContain(
      "FORM_RATE_LIMIT",
    );
    expect(wrangler.assets?.run_worker_first).toEqual(["/*/"]);
  });

  it("deletes the legacy Durable Object classes after creating them", () => {
    const legacy = ["DOQueueHandler", "DOShardedTagCache"];
    expect(wrangler.durable_objects).toBeUndefined();
    expect(wrangler.migrations).toEqual([
      { tag: "v1", new_sqlite_classes: legacy },
      { tag: "v2", deleted_classes: legacy },
    ]);
    expect(server).not.toMatch(/DurableObject/);
  });
});
