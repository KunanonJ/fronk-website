import { Outlet, createFileRoute } from "@tanstack/react-router";
import SystemLayout from "@/app/(system)/layout";

/** Pathless layout for /resume and /design: the (system) route group in Next. */
export const Route = createFileRoute("/_system")({
  component: () => (
    <SystemLayout>
      <Outlet />
    </SystemLayout>
  ),
});
