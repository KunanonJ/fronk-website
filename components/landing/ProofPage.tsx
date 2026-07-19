"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import LibraryPageShell from "@/components/landing/LibraryPageShell";
import {
  getProofCards,
  getProofMetrics,
  proofPage,
} from "@/lib/content/proof";

export default function ProofPage() {
  const metrics = getProofMetrics();
  const cards = getProofCards();

  return (
    <LibraryPageShell
      eyebrow={proofPage.eyebrow}
      title={proofPage.title}
      description={proofPage.description}
      navId="proof-mobile-nav"
    >
      {metrics.length > 0 ? (
        <ul className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {metrics.map((metric) => (
            <li
              key={`${metric.source}-${metric.label}`}
              className="rounded-2xl border border-white/10 bg-[#101010] px-4 py-5"
            >
              <p className="text-2xl font-medium text-primary sm:text-3xl">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-primary/70">{metric.label}</p>
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-primary/40">
                {metric.source}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const className =
            "group flex flex-col rounded-2xl border border-white/10 bg-[#101010] p-5 transition-colors hover:border-white/25 sm:p-6";
          const inner = (
            <>
              {card.source ? (
                <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-primary/45">
                  {card.source}
                </p>
              ) : null}
              <h2 className="text-base font-medium text-primary sm:text-lg">
                {card.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-primary/65">
                {card.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary/70 transition-colors group-hover:text-primary">
                View
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </>
          );

          if (card.external) {
            return (
              <a
                key={card.id}
                href={card.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            );
          }

          return (
            <Link key={card.id} href={card.href} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </LibraryPageShell>
  );
}
