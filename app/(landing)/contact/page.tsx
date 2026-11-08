import type { Metadata } from "next";
import FormaContactPage from "@/components/landing/FormaContactPage";
import { contactPage } from "@/lib/content/contact";
import { routeShareMeta } from "@/lib/seo/routeMeta";

export const metadata: Metadata = routeShareMeta({
  title: contactPage.metaTitle,
  description: contactPage.metaDescription,
  path: "/contact",
});

export default function ContactRoute() {
  return <FormaContactPage />;
}
