"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import {
  formatPressDate,
  pressItems,
  pressPage,
  type PressItem,
} from "@/lib/content/press";
import { expandHashHref } from "@/lib/landing/nav";

function PressCard({ item }: { item: PressItem }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#101010] transition-colors hover:border-white/25">
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-[16/9] overflow-hidden bg-black/40"
      >
        <Image
          src={item.bannerSrc}
          alt={item.bannerAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </a>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.16em] text-primary/50">
          <time dateTime={item.date}>{formatPressDate(item.date)}</time>
          {item.source ? <span>{item.source}</span> : null}
        </div>

        <h2 className="text-lg font-medium leading-snug tracking-tight text-primary sm:text-xl">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
          >
            {item.title}
          </a>
        </h2>

        <p className="line-clamp-2 text-sm leading-relaxed text-primary/65">
          {item.description}
        </p>

        <div className="mt-auto pt-2">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-white/35 hover:bg-white/10"
          >
            View
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * Press index — banner cards with View CTA, title, blurb, DD/MM/YYYY date.
 * Pattern inspired by toppjirayut.com/press (external article cards).
 */
export default function PressPage() {
  return (
    <div className="relative min-h-[100svh] bg-black text-primary">
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId="press-mobile-nav"
      />

      <main id="main" className="relative z-10 px-4 pb-20 pt-28 sm:px-6 md:px-10">
        <header className="mx-auto mb-10 max-w-6xl sm:mb-14">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/60 sm:text-xs">
            {pressPage.eyebrow}
          </p>
          <h1
            className="text-4xl font-medium tracking-tight text-primary sm:text-5xl md:text-6xl"
            style={{
              fontFamily:
                "var(--font-instrument-serif), 'Instrument Serif', serif",
            }}
          >
            {pressPage.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary/65 sm:text-base">
            {pressPage.description}
          </p>
        </header>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {pressItems.map((item) => (
            <PressCard key={item.id} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}
