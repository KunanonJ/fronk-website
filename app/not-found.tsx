import { siteConfig } from "@/lib/site";
import Link from "next/link";

const destinations = [
  { href: "/", label: "Home" },
  { href: "/showcase", label: "Showcase" },
  { href: "/#ventures", label: "Ventures" },
  { href: "/#contact", label: "Contact" },
] as const;

export default function NotFound() {
  return (
    <main className="landing-root flex min-h-[100svh] flex-col items-start justify-center bg-landing px-6 py-20 text-primary">
      <p className="text-xs uppercase tracking-[0.2em] text-primary/60">404</p>
      <h1 className="mt-4 text-5xl font-semibold leading-none tracking-tight sm:text-7xl">
        Nothing lives here.
      </h1>
      <p className="mt-4 max-w-prose text-primary/70">
        Either the URL is stale, or this page never existed. Try one of these
        instead.
      </p>

      <nav aria-label="Recovery links" className="mt-8 flex flex-wrap gap-4">
        {destinations.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="text-sm text-primary underline decoration-white/20 underline-offset-4 transition-opacity duration-200 hover:opacity-60"
          >
            {d.label}
          </Link>
        ))}
      </nav>

      <p className="mt-10 text-xs text-primary/50">
        Broken link?{" "}
        <a
          href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Broken link on ${siteConfig.url}`)}`}
          className="underline decoration-white/20 underline-offset-4 transition-opacity hover:opacity-60"
        >
          {siteConfig.email}
        </a>
      </p>
    </main>
  );
}
