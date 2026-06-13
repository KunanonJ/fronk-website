import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
      <Badge variant="outline">404</Badge>
      <h1 className="mt-4 font-display text-5xl font-bold leading-none tracking-tight sm:text-7xl">
        Nothing lives here.
      </h1>
      <p className="mt-4 max-w-prose text-muted">
        Either the URL is stale, or this page never existed in the first place.
        Founder sites change shape often — try one of these instead.
      </p>

      <nav aria-label="Recovery links" className="mt-8 flex flex-wrap gap-3">
        {destinations.map((d) => (
          <Button key={d.href} href={d.href} variant="secondary" size="sm">
            {d.label}
          </Button>
        ))}
      </nav>

      <p className="mt-10 text-xs text-muted">
        Followed a broken link? Let me know at{" "}
        <a
          href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(`Broken link on ${siteConfig.url}`)}`}
          className="underline decoration-accent underline-offset-4 hover:text-fg"
        >
          {siteConfig.email}
        </a>
        .
      </p>
    </Container>
  );
}
