import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy stock URL: About now lives at /about (308, as Next serves it). */
export const Route = createFileRoute("/_landing/stock/asme")({
  beforeLoad: () => {
    throw redirect({ to: "/about", statusCode: 308 });
  },
});
