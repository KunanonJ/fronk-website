import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { PageMain } from "@/components/bento/Bento";
import ContactPage from "@/components/landing/ContactPage";
import type { Metadata } from "@/lib/seo/types";
import {
  CONTACT_SEARCH_DEFAULTS,
  contactSearchSchema,
} from "@/lib/contact/search";
import { usePrerenderedParam } from "@/src/lib/filterParam";
import { pageHead } from "@/src/lib/head";
import { routeShareMeta } from "@/lib/seo/routeMeta";
import { PAGE_META } from "@/lib/content/pageMeta";

const metadata: Metadata = routeShareMeta({
  title: PAGE_META.contact.title,
  description: PAGE_META.contact.description,
  path: "/contact",
});

/**
 * /contact. `?topic=hiring` (typed, Valibot) is where every recruiter button
 * leads: it opens the form with the Hiring topic chosen. The default,
 * general, never shows in the URL and an unknown value falls back to it.
 */
export const Route = createFileRoute("/_landing/contact")({
  validateSearch: contactSearchSchema,
  search: { middlewares: [stripSearchParams(CONTACT_SEARCH_DEFAULTS)] },
  head: () => pageHead(metadata),
  component: ContactRoute,
});

function ContactRoute() {
  const intent = usePrerenderedParam(
    Route.useSearch().topic,
    CONTACT_SEARCH_DEFAULTS.topic,
  );
  return (
    <PageMain>
      <ContactPage intent={intent} />
    </PageMain>
  );
}
