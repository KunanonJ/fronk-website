import { Outlet, createFileRoute } from "@tanstack/react-router";
import SystemLayout from "@/components/system/SystemLayout";

/** Pathless layout for /design (/resume moved to the site layout in phase 7b). */
export const Route = createFileRoute("/_system")({
  component: () => (
    <SystemLayout>
      <Outlet />
    </SystemLayout>
  ),
});
