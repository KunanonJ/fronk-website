import Link from "@/components/navigation/Link";
import { Card } from "@/components/ui/Card";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { PixelGrid } from "@/components/ui/PixelGrid";
import { siteConfig } from "@/lib/site";

const destinations = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/#ventures", label: "Ventures" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * 404 (visual-redesign Phase 1). The pixel grid uses the "failed" state, so
 * its Ember squares sit on a Paper card next to the visible words
 * "404 · Not found" (Ember always comes with a label).
 */
export default function NotFound() {
  return (
    <main
      id="main"
      className="landing-root flex min-h-[100svh] items-center bg-page px-4 py-20 text-ink sm:px-6"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
        <div>
          <MonoLabel>404 · Not found</MonoLabel>
          <h1 className="mt-4 font-display text-h1 text-ink">Nothing lives here.</h1>
          <p className="mt-4 max-w-prose text-body text-ink-2">
            Either the URL is stale, or this page never existed. Try one of
            these instead.
          </p>

          <nav aria-label="Recovery links" className="mt-8 flex flex-wrap gap-3">
            {destinations.map((d, i) => (
              <Link
                key={d.href}
                href={d.href}
                className={
                  i === 0
                    ? "inline-flex min-h-11 items-center rounded-full bg-action px-5 text-sm font-medium text-on-action transition-colors hover:bg-action-hover"
                    : "inline-flex min-h-11 items-center rounded-full border border-hairline-strong bg-surface px-5 text-sm font-medium text-ink transition-colors hover:bg-surface-tint"
                }
              >
                {d.label}
              </Link>
            ))}
          </nav>

          <p className="mt-10 text-small text-ink-2">
            Broken link?{" "}
            <a
              href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Broken link on ${siteConfig.url}`)}`}
              className="text-link underline underline-offset-4"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <PixelGrid cols={12} rows={8} seed={404} state="failed" />
        </Card>
      </div>
    </main>
  );
}
