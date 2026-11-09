import { createFileRoute } from "@tanstack/react-router";
import render from "@/app/opengraph-image";

/** Next's file-convention image (next/og is @cf-wasm/og in this build). */
export const Route = createFileRoute("/opengraph-image")({
  server: {
    handlers: {
      GET: async ({  }) => render(),
    },
  },
});
