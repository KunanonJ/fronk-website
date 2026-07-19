import type { Metadata } from "next";
import FormaContactPage from "@/components/landing/FormaContactPage";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: "Contact",
  description: "Say hello — craft bold ideas and ship them as products.",
  path: "/contact",
});

export default function ContactRoute() {
  return <FormaContactPage />;
}
