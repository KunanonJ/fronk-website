import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { ctaClasses } from "@/components/bento/Buttons";
import StatusPage, {
  type StatusPageCopy,
} from "@/components/landing/StatusPage";
import { siteConfig } from "@/lib/site";

const COPY: StatusPageCopy = {
  eyebrow: "Page didn't load",
  headline: { muted: "Something", middle: "went", accent: "wrong." },
  lead: "A service this page depends on didn't answer. Try again, or come back in a minute.",
  status: "Error · Didn't load",
  seed: 500,
  report: {
    title: "Still broken?",
    subject: `Page error on ${siteConfig.url}`,
  },
};

/**
 * Error state for any route whose loader or render throws (for example a
 * Sanity outage), in the 404 layout (design spec 6). Nested routes fail
 * inside their layout, so public pages keep the site header and footer; a
 * failure in a layout itself renders bare. The response is not edge-cached,
 * so the next visit retries; "Try again" re-runs the route's loaders in place.
 */
export default function RouteError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <StatusPage
      copy={COPY}
      alert
      actions={
        <button
          type="button"
          onClick={() => {
            reset();
            void router.invalidate();
          }}
          className={ctaClasses()}
        >
          Try again
        </button>
      }
    />
  );
}
