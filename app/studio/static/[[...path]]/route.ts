import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

export function resolveStudioStaticAssetPath(path: string[] | undefined) {
  if (!path?.length) return null;
  if (path.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  return `/studio/static/${path.map(encodeURIComponent).join("/")}`;
}

export async function GET(
  request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { path } = await params;
  const assetPath = resolveStudioStaticAssetPath(path);
  if (!assetPath) return new Response("Not found", { status: 404 });

  const { env } = await getCloudflareContext({ async: true });
  if (!env.ASSETS)
    return new Response("Assets binding unavailable", { status: 500 });

  const assetUrl = new URL(request.url);
  assetUrl.pathname = assetPath;
  assetUrl.search = "";

  return env.ASSETS.fetch(assetUrl);
}
