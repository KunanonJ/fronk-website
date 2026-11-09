"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
} from "@/components/landing/about/SocialIcons";
import { aboutPage } from "@/lib/content/aboutPage";
import { socials } from "@/lib/content/landing";
import { expandHashHref } from "@/lib/landing/nav";

const SOCIAL_ICONS = {
  X: XIcon,
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
} as const satisfies Record<(typeof socials)[number]["label"], unknown>;

/**
 * About hero: centered portrait, name (the page h1, so name queries match the
 * heading), role line, two CTAs, socials, and a jump link to the story.
 * Theme-aware; only the text fades in. The portrait is the LCP element and
 * paints at once, served as a pre-sized 480px WebP.
 */
export default function AboutHero() {
  const { hero } = aboutPage;

  return (
    <div className="relative bg-page text-ink">
      <LandingTopNav
        position="fixed"
        wordmarkHref="/"
        resolveHref={expandHashHref}
        navId="about-mobile-nav"
      />

      <section
        aria-labelledby="about-hero-title"
        className="relative overflow-hidden px-4 pt-32 pb-16 sm:px-6 sm:pt-40 sm:pb-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-surface-tint blur-3xl sm:top-24 sm:h-96 sm:w-96"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          {/* Plain <img>: Next's optimizer passes images through unchanged on
              Workers, and next/image would add ~7 KB of client JS here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.portraitSrc}
            alt={hero.portraitAlt}
            width={160}
            height={160}
            fetchPriority="high"
            decoding="async"
            className="h-32 w-32 rounded-full object-cover shadow-card ring-1 ring-hairline-strong ring-offset-4 ring-offset-page sm:h-40 sm:w-40"
          />

          <h1
            id="about-hero-title"
            className="animate-fade-rise-delay mt-8 font-display text-[clamp(2.75rem,1.9rem+3.2vw,4.5rem)] leading-none font-semibold tracking-[-0.045em] text-ink"
          >
            {hero.title}
          </h1>

          <p className="animate-fade-rise-delay mt-3 font-mono text-label uppercase text-ink-2">
            {hero.nickname} · {hero.location}
          </p>

          <p className="animate-fade-rise-delay-2 mt-6 max-w-xl text-lead text-ink-2">
            {hero.role}
          </p>

          <div className="animate-fade-rise-delay-2 mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex min-h-12 items-center rounded-full bg-action px-6 text-sm font-medium text-on-action transition-colors hover:bg-action-hover"
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex min-h-12 items-center rounded-full border border-hairline-strong bg-surface px-6 text-sm font-medium text-ink transition-colors hover:bg-surface-tint"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>

          <ul className="animate-fade-rise-delay-2 mt-6 flex gap-2" aria-label="Social profiles">
            {socials.map(({ label, href }) => {
              const Icon = SOCIAL_ICONS[label];
              return (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline-strong bg-surface text-ink-2 transition-colors hover:border-ink/40 hover:text-ink"
                  >
                    <Icon size={18} />
                  </a>
                </li>
              );
            })}
          </ul>

          <a
            href={hero.storyHref}
            className="mt-12 inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink"
          >
            {hero.storyLabel}
            <ArrowDown className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
