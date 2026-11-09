import Link from "@/components/navigation/Link";
import { resolveExternalStudioUrl } from "@/sanity/studio-url";

export default function StudioPage() {
  const studioUrl = resolveExternalStudioUrl();

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6 py-16 text-ink">
      <section className="w-full max-w-2xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.18em] text-ink-2 uppercase">
            Sanity Studio
          </p>
          <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
            Studio now runs outside the public site runtime.
          </h1>
          <p className="max-w-xl text-base leading-7 text-ink-2">
            The Cloudflare Worker serves the public website and API routes. Use
            the configured Sanity Studio deployment for editorial work.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {studioUrl ? (
            <a
              href={studioUrl}
              className="inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-4 text-sm font-medium text-page transition-colors hover:bg-ink/90"
              rel="noreferrer"
            >
              Open Studio
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center justify-center border border-ink/40 px-4 text-sm font-medium text-ink-2">
              Studio URL not configured
            </span>
          )}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center border border-hairline-strong px-4 text-sm font-medium transition-colors hover:border-ink/40"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
