import {
  SIGNATURE_HEADER_NAME,
  decodeSignatureHeader,
  isValidSignature,
} from "@sanity/webhook";
import { getRevalidationTagsForType } from "@/lib/sanity/revalidation";

/*
 * Sanity webhook → Worker cache purge (replaces Next's revalidateTag). Runs in
 * src/server.ts, the only place that has the Worker's ctx.cache.
 */

export type CachePurger = {
  purge(options: {
    tags: string[];
  }): Promise<{ success: boolean; errors?: unknown[] }>;
};

/**
 * Cloudflare's answer, or a failure in the same shape: no cache object, or
 * a purge that threw. `success` means Cloudflare accepted the purge.
 */
async function purgeTags(
  cache: CachePurger | undefined,
  tags: string[],
): Promise<{ success: boolean; errors?: unknown[] }> {
  if (!cache)
    return { success: false, errors: ["Worker cache is not enabled"] };
  try {
    return await cache.purge({ tags });
  } catch (error: unknown) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * How old a signed webhook may be. Sanity signs the timestamp, so a captured
 * request cannot be replayed after this window. A delivery that arrives
 * later, or never, is covered by the edge lifetime: a cached copy ends
 * within the hour (src/lib/cache.ts).
 */
export const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;

export async function handleSanityWebhook(
  request: Request,
  secret: string | undefined,
  cache: CachePurger | undefined,
  now: number = Date.now(),
): Promise<Response> {
  if (!secret)
    return Response.json(
      { message: "Missing SANITY_REVALIDATE_SECRET" },
      { status: 500 },
    );

  const payload = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  if (!signature || !(await isValidSignature(payload, signature, secret))) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }
  // The signature is valid, so the header decodes; its timestamp is in ms.
  if (
    Math.abs(now - decodeSignatureHeader(signature).timestamp) >
    WEBHOOK_MAX_AGE_MS
  ) {
    return Response.json({ message: "Stale signature" }, { status: 401 });
  }

  let body: { _type?: string } | null;
  try {
    body = JSON.parse(payload) as { _type?: string };
  } catch {
    body = null;
  }
  if (!body) return Response.json({ message: "Empty body" }, { status: 400 });

  const tags = [...getRevalidationTagsForType(body._type)];
  const result = await purgeTags(cache, tags);
  // A 500 makes Sanity retry the delivery twice; the log shows it in the
  // Worker's logs. If the purge keeps failing, the copy still ends within
  // the hour.
  if (!result.success)
    console.error("[revalidate] cache purge failed", tags, result.errors);
  const status = result.success ? 200 : 500;
  return Response.json(
    { status, revalidated: result.success, tags, now },
    { status },
  );
}
