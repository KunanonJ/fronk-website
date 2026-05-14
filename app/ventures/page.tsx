import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { VentureCard } from "@/components/VentureCard";
import { getAllVentures } from "@/lib/content/ventures";

export const metadata: Metadata = {
  title: "Ventures",
  description:
    "Companies and products I've founded or co-founded. The wins, the shutdowns, and what each one taught me.",
};

export default function VenturesPage() {
  const ventures = getAllVentures();

  return (
    <Container size="xl" className="py-20">
      <header className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-widest text-muted">Ventures</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Things I've started.
        </h1>
        <p className="mt-4 text-lg text-muted">
          A running list of companies and products I've founded or co-founded.
          Includes the ones that didn't work — those are the more useful pages.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ventures.map((venture, i) => (
          <div
            key={venture.slug}
            className="animate-fade-up stagger"
            style={{ ["--i" as string]: i }}
          >
            <VentureCard venture={venture} />
          </div>
        ))}
      </div>
    </Container>
  );
}
