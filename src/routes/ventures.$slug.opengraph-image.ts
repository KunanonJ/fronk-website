import { createFileRoute } from "@tanstack/react-router";
import render from "@/app/(landing)/ventures/[slug]/opengraph-image";

/** Next's file-convention image (next/og is @cf-wasm/og in this build). */
export const Route = createFileRoute("/ventures/$slug/opengraph-image")({
  server: {
    handlers: {
      GET: async ({ params }) => render({ params: Promise.resolve(params) }),
    },
  },
});
