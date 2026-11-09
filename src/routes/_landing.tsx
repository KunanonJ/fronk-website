import { Outlet, createFileRoute } from "@tanstack/react-router";
import LandingLayout from "@/components/landing/LandingLayout";

/** Pathless layout for the public site: the (landing) route group in Next. */
export const Route = createFileRoute("/_landing")({
  component: () => (
    <LandingLayout>
      <Outlet />
    </LandingLayout>
  ),
});
