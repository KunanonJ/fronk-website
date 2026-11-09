import { SIGNATURE_HEADER_NAME, isValidSignature } from "@sanity/webhook";
import { REVALIDATE_TAGS, getRevalidationTagsForType } from "@/lib/sanity/revalidation";

/*
 * Sanity webhook → Worker cache purge (replaces Next's revalidateTag). Runs in
 * src/server.ts, the only place that has the Worker's ctx.cache.
 */

export type CachePurger = {
  purge(options: { tags: string[] }): Promise<{ success: boolean; errors?: unknown[] }>;
};

export const ALL_CONTENT_TAGS = Object.values(REVALIDATE_TAGS);

export async function purgeTags(cache: CachePurger | undefined, tags: string[]) {
  if (!cache) return { success: false, errors: ["Worker cache is not enabled"] };
  return cache.purge({ tags });
}

export async function handleSanityWebhook(
  request: Request,
  secret: string | undefined,
  cache: CachePurger | undefined,
): Promise<Response> {
  if (!secret) return Response.json({ message: "Missing SANITY_REVALIDATE_SECRET" }, { status: 500 });

  const payload = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) ?? "";
  if (!signature || !(await isValidSignature(payload, signature, secret))) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }

  let body: { _type?: string } | null = null;
  try {
    body = JSON.parse(payload) as { _type?: string };
  } catch {
    body = null;
  }
  if (!body) return Response.json({ message: "Empty body" }, { status: 400 });

  const tags = [...getRevalidationTagsForType(body._type)];
  const result = await purgeTags(cache, tags);
  return Response.json({ status: 200, revalidated: result.success, tags, now: Date.now() }, { status: result.success ? 200 : 500 });
}
