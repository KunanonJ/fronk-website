"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { about } from "@/lib/content/landing";
import { AnnotatedText } from "@/components/landing/AnnotatedText";
import WordsPullUpMultiStyle from "@/components/landing/WordsPullUpMultiStyle";

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-8 bg-landing px-3 py-12 sm:px-6 sm:py-16 md:scroll-mt-28 md:py-24 lg:py-32"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center rounded-2xl bg-[#101010] px-5 py-10 text-center sm:px-10 sm:py-16 md:px-16 md:py-20 lg:rounded-3xl">
        <p className="mb-4 text-[10px] text-primary sm:mb-6 sm:text-xs">
          {about.label}
        </p>

        <div className="mx-auto mb-6 w-full max-w-3xl px-1 text-[1.65rem] leading-[1.15] sm:mb-8 sm:text-4xl sm:leading-[1.1] md:text-5xl lg:text-6xl lg:leading-[1.05] xl:text-7xl">
          <WordsPullUpMultiStyle
            stackLines
            className="gap-1 sm:gap-1.5"
            lineClassName="text-center"
            segments={[...about.segments]}
          />
        </div>

        <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-primary/65 sm:mb-10 sm:text-base">
          <AnnotatedText text={about.body} />
        </p>

        <Link
          href={about.ctaHref}
          className="group inline-flex w-full touch-manipulation items-center justify-between gap-2 rounded-full bg-cream py-1.5 pl-5 pr-1.5 text-sm font-medium text-black transition-[gap] hover:gap-3 sm:w-fit sm:text-base"
        >
          {about.ctaLabel}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
            <ArrowRight className="h-4 w-4 text-cream" />
          </span>
        </Link>
      </div>
    </section>
  );
}
