"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import {
  EXAMPLE_PERSONAS,
  examplesByPersona,
  examplesPage,
  type ExamplePersona,
} from "@/lib/content/examples";

export default function ExamplesPage() {
  const [persona, setPersona] = useState<ExamplePersona>("Builders");
  const cards = examplesByPersona[persona];

  return (
    <LibraryPageShell
      eyebrow={examplesPage.eyebrow}
      title={examplesPage.title}
      description={examplesPage.description}
      navId="examples-mobile-nav"
    >
      <div
        role="tablist"
        aria-label="Example personas"
        className="mb-8 flex flex-wrap gap-2"
      >
        {EXAMPLE_PERSONAS.map((item) => {
          const active = item === persona;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              className={
                active
                  ? "rounded-full bg-cream px-4 py-2 text-sm font-medium text-black"
                  : "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-primary/75 transition-colors hover:border-white/30 hover:text-primary"
              }
              onClick={() => setPersona(item)}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group flex flex-col rounded-2xl border border-white/10 bg-[#101010] p-5 transition-colors hover:border-white/25 sm:p-6"
          >
            <h2 className="text-base font-medium text-primary sm:text-lg">
              {card.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-primary/65">
              {card.body}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary/70 transition-colors group-hover:text-primary">
              {card.ctaLabel}
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </LibraryPageShell>
  );
}
