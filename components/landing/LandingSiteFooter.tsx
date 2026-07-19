import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  contact,
  footerLibrary,
  footerResources,
  socials,
} from "@/lib/content/landing";

/**
 * Global landing footer — contact, library, and machine-readable indexes.
 * Mounted from the landing layout so every public page shares the same chrome.
 */
export default function LandingSiteFooter() {
  return (
    <footer
      id="contact"
      className="scroll-mt-28 border-t border-black/10 bg-landing px-4 py-12 text-center text-primary sm:px-6 md:py-16 dark:border-white/10"
    >
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/70 sm:text-xs">
        {contact.label}
      </p>
      <a
        href={`mailto:${contact.email}`}
        className="inline-flex min-h-11 items-center text-base text-primary transition-opacity hover:opacity-80 sm:text-lg md:text-xl"
      >
        {contact.email}
      </a>
      <p className="mx-auto mt-4 max-w-md text-sm text-primary/60">
        {contact.tagline}
      </p>
      <div className="mt-6 flex justify-center">
        <Link
          href={contact.ctaHref}
          className="group inline-flex w-fit touch-manipulation items-center gap-2 rounded-full bg-cream py-1.5 pl-5 pr-1.5 text-sm font-medium text-black transition-[gap] hover:gap-3 sm:text-base"
        >
          {contact.ctaLabel}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
            <ArrowRight className="h-4 w-4 text-cream" />
          </span>
        </Link>
      </div>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {socials.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary/70 underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <nav
        aria-label="Library"
        className="mx-auto mt-10 max-w-2xl border-t border-black/10 pt-6 dark:border-white/10"
      >
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/50">
          Library
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-5">
          {footerLibrary.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm text-primary/70 underline-offset-2 transition-colors hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-label="Machine-readable resources"
        className="mx-auto mt-8 max-w-2xl border-t border-black/10 pt-6 dark:border-white/10"
      >
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-primary/50">
          For agents &amp; indexes
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-5">
          {footerResources.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-mono text-xs text-primary/55 underline-offset-2 transition-colors hover:text-primary hover:underline sm:text-sm"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
