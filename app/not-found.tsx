import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site";

const destinations = [
  { href: "/", label: "Home" },
  { href: "/ventures", label: "Ventures" },
  { href: "/writing", label: "Writing" },
  { href: "/contact", label: "Contact" },
] as const;

export default function NotFound() {
  return (
    <Container
      size="md"
      className="flex min-h-[60vh] flex-col items-start justify-center py-20"
    >
      <p className="text-sm uppercase tracking-widest text-muted">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Nothing lives here.
      </h1>
      <p className="mt-4 max-w-prose text-muted">
        Either the URL is stale, or this page never existed in the first place.
        Founder sites change shape often — try one of these instead.
      </p>

      <nav aria-label="Recovery links" className="mt-8">
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          {destinations.map((d) => (
            <li key={d.href}>
              <Link href={d.href} className="text-accent hover:underline">
                {d.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="mt-10 text-xs text-muted">
        Followed a broken link? Let me know at{" "}
        <a
          href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Broken link on ${siteConfig.url}`)}`}
          className="underline underline-offset-2 hover:text-fg"
        >
          {siteConfig.email}
        </a>
        .
      </p>
    </Container>
  );
}
