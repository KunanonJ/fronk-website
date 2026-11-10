import { createFileRoute } from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import ContactPage from "@/components/landing/ContactPage";
import type { Metadata } from "@/lib/seo/types";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.contact.title,
  description: PAGE_META.contact.description,
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
