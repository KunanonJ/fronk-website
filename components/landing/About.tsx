"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { about } from "@/lib/content/landing";
import WordsPullUpMultiStyle from "@/components/landing/WordsPullUpMultiStyle";

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-black px-3 py-12 sm:px-6 sm:py-16 md:py-24 lg:py-32"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center rounded-2xl bg-[#101010] px-5 py-10 text-center sm:px-10 sm:py-16 md:px-16 md:py-20 lg:rounded-3xl">
        <p className="mb-4 text-[10px] text-primary sm:mb-6 sm:text-xs">
          {about.label}
        </p>

        <div className="mx-auto mb-8 w-full max-w-3xl px-1 text-[1.65rem] leading-[1.15] sm:mb-10 sm:text-4xl sm:leading-[1.1] md:text-5xl lg:text-6xl lg:leading-[1.05] xl:text-7xl">
          <WordsPullUpMultiStyle
            stackLines
            className="gap-1 sm:gap-1.5"
            lineClassName="text-center"
            segments={[...about.segments]}
          />
        </div>

        <Link
          href={about.ctaHref}
          className="group inline-flex w-fit touch-manipulation items-center gap-2 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-black transition-[gap] hover:gap-3 sm:text-base"
        >
          {about.ctaLabel}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
            <ArrowRight className="h-4 w-4 text-primary" />
          </span>
        </Link>
      </div>
    </section>
  );
}
