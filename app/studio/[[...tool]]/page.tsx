import Link from "next/link";
import { resolveExternalStudioUrl } from "@/sanity/studio-url";

export default function StudioPage() {
  const studioUrl = resolveExternalStudioUrl();

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-16 text-fg">
      <section className="w-full max-w-2xl space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.18em] text-muted uppercase">
            Sanity Studio
          </p>
          <h1 className="text-3xl font-semibold text-balance sm:text-4xl">
            Studio now runs outside the public site runtime.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            The Cloudflare Worker serves the public website and API routes. Use
            the configured Sanity Studio deployment for editorial work.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {studioUrl ? (
            <a
              href={studioUrl}
              className="inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent/90"
              rel="noreferrer"
            >
              Open Studio
            </a>
          ) : (
            <span className="inline-flex min-h-11 items-center justify-center border border-border-strong px-4 text-sm font-medium text-muted">
              Studio URL not configured
            </span>
          )}
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center border border-border px-4 text-sm font-medium transition-colors hover:border-border-strong"
          >
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
