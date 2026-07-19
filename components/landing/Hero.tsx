"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { hero, nav } from "@/lib/content/landing";
import WordsPullUp from "@/components/landing/WordsPullUp";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4";

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", closeOnDesktop);
    return () => mq.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <section className="h-[100svh] max-h-[100dvh] min-h-[100svh] p-3 sm:p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO}
          autoPlay
          loop
          muted
          playsInline
        />

        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <nav
          className="absolute left-1/2 top-0 z-20 hidden max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-b-2xl bg-black px-3 py-2 sm:px-4 md:block md:rounded-b-3xl md:px-8"
          aria-label="Primary"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-6 md:gap-x-10 lg:gap-x-14">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-9 items-center text-[10px] transition-colors sm:text-xs md:min-h-0 md:text-sm"
                  style={{ color: "rgba(225, 224, 204, 0.8)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#E1E0CC";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)";
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute left-1/2 top-0 z-30 flex w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 justify-center md:hidden">
          <div className="w-full rounded-b-2xl bg-black px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-xs font-medium tracking-wide"
                style={{ color: "#E1E0CC" }}
              >
                {hero.wordmark}
              </span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-primary"
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>

            {menuOpen && (
              <nav id="mobile-nav" aria-label="Primary" className="pb-2 pt-1">
                <ul className="flex flex-col">
                  {nav.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="flex min-h-11 items-center text-sm"
                        style={{ color: "rgba(225, 224, 204, 0.9)" }}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-12 items-end gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 min-w-0 lg:col-span-8">
              <h1
                className="max-w-full overflow-visible font-medium leading-[0.85] tracking-[-0.07em] text-[clamp(2.75rem,18vw,9rem)] sm:text-[20vw] md:text-[18vw] lg:text-[16vw] xl:text-[15vw]"
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp text={hero.wordmark} showAsterisk={false} />
              </h1>
            </div>

            <div className="col-span-12 flex max-w-md flex-col gap-3 sm:gap-4 lg:col-span-4 lg:max-w-none lg:pb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 sm:text-xs">
                {hero.contextLabel}
              </p>
              <motion.p
                className="text-xs text-primary/70 sm:text-sm md:text-base"
                style={{ lineHeight: 1.25 }}
                initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.7, delay: 0.5, ease: EASE }
                }
              >
                {hero.description}
              </motion.p>

              <motion.a
                href={hero.ctaHref}
                className="group inline-flex w-fit touch-manipulation items-center gap-2 rounded-full bg-primary py-1.5 pl-5 pr-1.5 text-sm font-medium text-black transition-[gap] hover:gap-3 sm:text-base"
                initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 0.7, delay: 0.7, ease: EASE }
                }
              >
                {hero.ctaLabel}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
