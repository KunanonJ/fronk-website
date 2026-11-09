import { createFileRoute } from "@tanstack/react-router";
import FormaContactPage from "@/components/landing/FormaContactPage";
import type { Metadata } from "@/lib/seo/types";
import { contactPage } from "@/lib/content/contact";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";

const metadata: Metadata = routeShareMeta({
  title: contactPage.metaTitle,
  description: contactPage.metaDescription,
  path: "/contact",
});

function ContactRoute() {
  return <FormaContactPage />;
}

export const Route = createFileRoute("/_landing/contact")({
  head: () => pageHead(metadata),
  component: ContactRoute,
});
