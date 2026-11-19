import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Pill } from "@/components/ds/Pill";
import StatusPage, {
  type StatusPageCopy,
} from "@/components/landing/StatusPage";
import { ERROR_ART } from "@/components/landing/statusArt";
import { siteConfig } from "@/lib/site";

const COPY: StatusPageCopy = {
  eyebrow: "Page didn't load",
  headline: { muted: "Something", middle: "went", accent: "wrong." },
  lead: "A service this page depends on didn't answer. Try again, or come back in a minute.",
  status: "Error · Didn't load",
  art: ERROR_ART,
  report: {
    title: "Still broken?",
    subject: `Page error on ${siteConfig.url}`,
  },
};

/**
 * Error state for any route whose loader or render throws (for example a
 * Sanity outage), in the 404 layout (profile redesign Phase 7f). Nested
 * routes fail inside their layout, so public pages keep the site's nav and
 * footer; a failure in a layout itself renders bare. The response is not
 * edge-cached, so the next visit retries; "Try again" re-runs the route's
 * loaders in place.
 */
export default function RouteError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <StatusPage
      copy={COPY}
      alert
      actions={
        <Pill
          onClick={() => {
            reset();
            void router.invalidate();
          }}
        >
          Try again
        </Pill>
      }
    />
  );
}
