import { createFileRoute } from "@tanstack/react-router";
import render from "@/app/apple-icon";

/** Next's file-convention image (next/og is @cf-wasm/og in this build). */
export const Route = createFileRoute("/apple-icon")({
  server: {
    handlers: {
      GET: async ({  }) => render(),
    },
  },
});
