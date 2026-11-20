import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import ContactPage from "@/components/profile/pages/ContactPage";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
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
 * /contact. `?topic=` (typed, Valibot) is where the work and recruiter
 * buttons lead: `project` opens the form with "Freelance or consulting"
 * chosen, `hiring` with "A future role". The default, general, never shows
 * in the URL and an unknown value falls back to it.
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
    <ProfileMain>
      <ContactPage intent={intent} />
    </ProfileMain>
  );
}
