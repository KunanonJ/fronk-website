import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container size="md" className="flex min-h-[60vh] flex-col items-start justify-center py-20">
      <p className="text-sm uppercase tracking-widest text-muted">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
        Page not found.
      </h1>
      <p className="mt-4 text-muted">
        The page you're looking for doesn't exist, or it moved while you weren't looking.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        ← Back home
      </Link>
    </Container>
  );
}
