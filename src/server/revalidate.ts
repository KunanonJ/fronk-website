import {
  SIGNATURE_HEADER_NAME,
  decodeSignatureHeader,
  isValidSignature,
} from "@sanity/webhook";
import {
  REVALIDATE_TAGS,
  getRevalidationTagsForType,
} from "@/lib/sanity/revalidation";

/*
 * Sanity webhook → Worker cache purge (replaces Next's revalidateTag). Runs in
 * src/server.ts, the only place that has the Worker's ctx.cache.
 */

export type CachePurger = {
  purge(options: {
    tags: string[];
  }): Promise<{ success: boolean; errors?: unknown[] }>;
};

export const ALL_CONTENT_TAGS = Object.values(REVALIDATE_TAGS);

export async function purgeTags(
  cache: CachePurger | undefined,
  tags: string[],
) {
  if (!cache)
    return { success: false, errors: ["Worker cache is not enabled"] };
  return cache.purge({ tags });
}

/**
 * How old a signed webhook may be. Sanity signs the timestamp, so a captured
 * request cannot be replayed after this window; a delivery that arrives later
 * is covered by the hourly purge.
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
  return Response.json(
    { status: 200, revalidated: result.success, tags, now },
    { status: result.success ? 200 : 500 },
  );
}

/**
 * GET /api/cron/revalidate with `Authorization: Bearer <CRON_SECRET>`: the
 * old fronk-website-revalidate-cron Worker calls this hourly. Kept so that
 * Worker does no harm until it is deleted; scheduled() does the same job.
 */
export async function handleCronRequest(
  request: Request,
  secret: string | undefined,
  cache: CachePurger | undefined,
): Promise<Response> {
  if (!secret)
    return Response.json({ message: "Missing CRON_SECRET" }, { status: 500 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  const result = await purgeTags(cache, ALL_CONTENT_TAGS);
  return Response.json(
    { revalidated: result.success, tags: ALL_CONTENT_TAGS },
    { status: result.success ? 200 : 500 },
  );
}
