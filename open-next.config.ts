import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";
import {
  softTagFilter,
  withFilter,
} from "@opennextjs/cloudflare/overrides/tag-cache/tag-cache-filter";

/**
 * Caching on Workers. Before 09-11-26 only `incrementalCache` was set, so the
 * queue and tag cache fell back to OpenNext's "dummy" overrides: stale pages
 * were never re-rendered (the dummy queue throws) and `revalidateTag` from the
 * Sanity webhook and the hourly cron did nothing (the dummy tag cache ignores
 * writes). Sanity edits only went live on the next deploy.
 *
 * - incrementalCache: rendered pages and fetch data in R2.
 * - queue: Durable Object queue (`NEXT_CACHE_DO_QUEUE`) that re-renders stale
 *   ISR pages through the `WORKER_SELF_REFERENCE` service binding.
 * - tagCache: sharded Durable Object tag cache (`NEXT_TAG_CACHE_DO_SHARDED`)
 *   that records `revalidateTag` calls. `softTagFilter` drops Next's implicit
 *   `_N_T_` path tags, which is safe because the app never calls
 *   `revalidatePath`, and saves Durable Object requests.
 *
 * Bindings and the v1 migration live in wrangler.jsonc.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  tagCache: withFilter({
    tagCache: doShardedTagCache({ baseShardSize: 4 }),
    filterFn: softTagFilter,
  }),
});
