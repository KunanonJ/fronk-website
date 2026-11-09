import { createFileRoute } from "@tanstack/react-router";
import StudioLayout, { metadata, viewport } from "@/components/studio/StudioLayout";
import StudioPage from "@/components/studio/StudioPage";
import { pageHead } from "@/src/lib/head";
import { viewportContent } from "@/lib/seo/metadataToHead";

/** CSP from next.config.ts headers(): Studio may be framed by sanity.io. */
const STUDIO_CSP = "frame-ancestors 'self' https://www.sanity.io https://*.sanity.io";

export const Route = createFileRoute("/studio")({
  head: () => {
    const head = pageHead(metadata);
    return { ...head, meta: [...head.meta, { name: "viewport", content: viewportContent(viewport) } as never] };
  },
  headers: () => ({ "Content-Security-Policy": STUDIO_CSP }),
  component: () => (
    <StudioLayout>
      <StudioPage />
    </StudioLayout>
  ),
});
