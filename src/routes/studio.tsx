import { createFileRoute } from "@tanstack/react-router";
import StudioLayout, {
  metadata,
  viewport,
} from "@/components/studio/StudioLayout";
import StudioPage from "@/components/studio/StudioPage";
import { NO_STORE } from "@/src/lib/cache";
import { pageHead } from "@/src/lib/head";
import { viewportContent } from "@/lib/seo/metadataToHead";

/** CSP from next.config.ts headers(): Studio may be framed by sanity.io. */
const STUDIO_CSP =
  "frame-ancestors 'self' https://www.sanity.io https://*.sanity.io";

/**
 * The Studio page is static: it links to the external Studio, whose URL is
 * set at build time. It changes only on a deploy, which empties the cache: a
 * day at the edge, while browsers revalidate. Only a successful render is
 * kept.
 */
const STUDIO_CACHE = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": "public, max-age=86400",
};

export const Route = createFileRoute("/studio")({
  head: () => {
    const head = pageHead(metadata);
    return {
      ...head,
      meta: [
        ...head.meta,
        { name: "viewport", content: viewportContent(viewport) } as never,
      ],
    };
  },
  headers: ({ match }) => ({
    "Content-Security-Policy": STUDIO_CSP,
    ...(match.status === "success" ? STUDIO_CACHE : NO_STORE),
  }),
  component: () => (
    <StudioLayout>
      <StudioPage />
    </StudioLayout>
  ),
});
