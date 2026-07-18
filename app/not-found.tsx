import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";
import Link from "next/link";

const destinations = [
  { href: "/", label: "Home" },
  { href: "/ventures", label: "Work" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
] as const;

export default function NotFound() {
  return (
    <Container
      size="md"
      className="flex min-h-[60vh] flex-col items-start justify-center py-20"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-none tracking-tight text-fg sm:text-7xl">
        Nothing lives here.
      </h1>
      <p className="mt-4 max-w-prose text-muted">
        Either the URL is stale, or this page never existed. Try one of these
        instead.
      </p>

      <nav aria-label="Recovery links" className="mt-8 flex flex-wrap gap-4">
        {destinations.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="text-sm text-fg underline decoration-border underline-offset-4 transition-opacity duration-200 hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {d.label}
          </Link>
        ))}
      </nav>

      <p className="mt-10 text-xs text-muted">
        Broken link?{" "}
        <a
          href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Broken link on ${siteConfig.url}`)}`}
          className="underline decoration-border underline-offset-4 transition-opacity hover:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {siteConfig.email}
        </a>
      </p>
    </Container>
  );
}
