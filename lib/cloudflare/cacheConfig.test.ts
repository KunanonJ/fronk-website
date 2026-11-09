import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseJsonc } from "@/scripts/wrangler-vars.mjs";

/**
 * Guards the production Worker config. Without `cache.enabled` the Cache-Tag
 * purge does nothing; without the cron there is no safety net for missed
 * Sanity webhooks; without the legacy Durable Object classes a dashboard
 * rollback to a Next.js version breaks. See wrangler.jsonc and src/server.ts.
 */
type WranglerConfig = {
  name: string;
  main: string;
  cache?: { enabled?: boolean };
  triggers?: { crons?: string[] };
  ratelimits?: { name: string }[];
  assets?: { run_worker_first?: string[] };
  durable_objects?: { bindings?: { class_name: string }[] };
  migrations?: { tag: string; new_sqlite_classes?: string[] }[];
};

const root = process.cwd();
const wrangler = parseJsonc(readFileSync(join(root, "wrangler.jsonc"), "utf8")) as WranglerConfig;
const server = readFileSync(join(root, "src/server.ts"), "utf8");

describe("production Worker config (TanStack Start)", () => {
  it("runs the Start entry with the Worker cache and the hourly purge", () => {
    expect(wrangler.name).toBe("fronk-website");
    expect(wrangler.main).toBe("src/server.ts");
    expect(wrangler.cache?.enabled).toBe(true);
    expect(wrangler.triggers?.crons).toEqual(["0 * * * *"]);
  });

  it("rate-limits the forms and routes trailing slashes through the Worker", () => {
    expect(wrangler.ratelimits?.map((r) => r.name)).toContain("FORM_RATE_LIMIT");
    expect(wrangler.assets?.run_worker_first).toEqual(["/*/"]);
  });

  it("keeps the legacy Durable Object classes bound and exported for rollback", () => {
    const bound = wrangler.durable_objects?.bindings?.map((b) => b.class_name);
    expect(bound).toEqual(expect.arrayContaining(["DOQueueHandler", "DOShardedTagCache"]));
    expect(wrangler.migrations?.[0]?.new_sqlite_classes).toEqual(["DOQueueHandler", "DOShardedTagCache"]);
    expect(server).toMatch(/export class DOQueueHandler extends DurableObject/);
    expect(server).toMatch(/export class DOShardedTagCache extends DurableObject/);
  });
});
