import { useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import Link from "@/components/navigation/Link";
import { MonoLabel } from "@/components/ui/MonoLabel";

/**
 * Error state for any route whose loader or render throws (for example a
 * Sanity outage). The response is not edge-cached, so the next visit retries;
 * "Try again" re-runs the route's loaders in place.
 */
export default function RouteError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <section
      role="alert"
      className="landing-root flex min-h-[60svh] items-center bg-page px-4 py-20 text-ink sm:px-6"
    >
      <div className="mx-auto w-full max-w-5xl">
        <MonoLabel>Error · Page didn&apos;t load</MonoLabel>
        <h1 className="mt-4 font-display text-h1 text-ink">Something went wrong.</h1>
        <p className="mt-4 max-w-prose text-body text-ink-2">
          A service this page depends on didn&apos;t answer. Try again, or come back in a minute.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              reset();
              void router.invalidate();
            }}
            className="inline-flex min-h-11 items-center rounded-full bg-action px-5 text-sm font-medium text-on-action transition-colors hover:bg-action-hover"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-hairline-strong bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-tint"
          >
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
