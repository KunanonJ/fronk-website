import { GET as llmsTxt } from "@/src/server/text/llms";

/**
 * The home page as Markdown: the /llms.txt brief, which is already Markdown,
 * served as text/markdown. The Worker answers `/` with it when a request asks
 * for Markdown (src/server/negotiate.ts). Its route sets the cache headers.
 */
export async function GET(): Promise<Response> {
  const brief = await llmsTxt();
  const headers = new Headers(brief.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  return new Response(brief.body, { status: brief.status, headers });
}
