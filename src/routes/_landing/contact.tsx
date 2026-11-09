import { createFileRoute } from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import ContactPage from "@/components/landing/ContactPage";
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
  return (
    <PageMain>
      <ContactPage />
    </PageMain>
  );
}

export const Route = createFileRoute("/_landing/contact")({
  head: () => pageHead(metadata),
  component: ContactRoute,
});
