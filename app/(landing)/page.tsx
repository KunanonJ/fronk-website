import type { Metadata } from "next";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import Hero from "@/components/landing/Hero";
import IntroLoader from "@/components/landing/IntroLoader";
import { contact, site, socials } from "@/lib/content/landing";

export const metadata: Metadata = {
  title: { absolute: site.title },
  description: site.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main id="main" className="min-h-[100svh] overflow-x-hidden bg-black">
      <IntroLoader />
      <Hero />
      <About />
      <Features />

      <footer
        id="contact"
        className="scroll-mt-20 border-t border-white/10 bg-black px-4 py-12 text-center sm:px-6 md:py-16"
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
      </footer>
    </main>
  );
}
