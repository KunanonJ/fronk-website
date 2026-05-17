import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { VentureCard } from "@/components/VentureCard";
import { getAllVentures } from "@/lib/content/ventures";
import { cssVar } from "@/lib/utils/cssVar";

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
          What I'm building.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Two active ventures, both grounded in Bangkok. One is a fintech, the
          other is an AI knowledge workspace. The links go straight to the
          products.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ventures.map((venture, i) => (
          <div
            key={venture.slug}
            className="animate-fade-up stagger"
            style={cssVar("--i", i)}
          >
            <VentureCard venture={venture} />
          </div>
        ))}
      </div>
    </Container>
  );
}
