"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SpotlightReveal from "@/components/landing/showcase/SpotlightReveal";
import { contact, hero, nav, site, socials } from "@/lib/content/landing";

const BASE_IMG =
  "https://soft-zoom-63098134.figma.site/_assets/v11/5c9f982199fde1d9b85a20e5396f0fa7bacaf9a3.png?w=2560";
const REVEAL_IMG =
  "https://soft-zoom-63098134.figma.site/_assets/v11/6be2165e31648955b4e071f4cf2a50bc572b9bfd.png?w=1536";

const HEADLINE =
  "I build fintech and AI workspaces that help ideas ship from Bangkok.";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;
const splashEase = [0.96, -0.02, 0.38, 1.01] as const;

export default function ShowcasePage() {
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [splashDone, setSplashDone] = useState(!!prefersReducedMotion);
  const words = HEADLINE.split(" ");

  useEffect(() => {
    document.body.style.backgroundColor = "#E4E4E4";
    return () => {
      document.body.style.backgroundColor = "#000000";
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setSplashDone(true);
      return;
    }
    const t = window.setTimeout(() => setSplashDone(true), 1650);
    return () => window.clearTimeout(t);
  }, [prefersReducedMotion]);

  return (
    <div
      className="min-h-[100svh] overflow-x-hidden"
      style={{ backgroundColor: "#E4E4E4", color: "#F4F1E8" }}
    >
      {/* Splash */}
      {!splashDone && (
        <div
          className="pointer-events-none fixed inset-0 z-[9999] h-screen w-screen overflow-hidden"
          aria-hidden
        >
          <div className="flex h-1/2 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`top-${i}`}
                className="h-full w-1/5"
                style={{ backgroundColor: "#75C5DE" }}
                initial={prefersReducedMotion ? false : { y: "0%" }}
                animate={prefersReducedMotion ? undefined : { y: "-100%" }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: splashEase,
                }}
              />
            ))}
          </div>
          <div className="flex h-1/2 w-full">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={`bot-${i}`}
                className="h-full w-1/5"
                style={{ backgroundColor: "#75C5DE" }}
                initial={prefersReducedMotion ? false : { y: "0%" }}
                animate={prefersReducedMotion ? undefined : { y: "100%" }}
                transition={{
                  duration: 1,
                  delay: i * 0.05,
                  ease: splashEase,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Logo */}
      <div className="fixed left-0 top-[30px] z-10 flex w-1/2 items-center mix-blend-difference md:top-10">
        <div className="pl-5 md:pl-10">
          <Link
            href="/"
            aria-label="Home"
            className="text-lg font-medium tracking-tight text-white"
          >
            {site.wordmark}
          </Link>
        </div>
      </div>

      {/* Burger */}
      <div className="fixed right-0 top-4 z-10 flex w-1/2 items-center justify-end md:top-[27px]">
        <div className="pr-5 md:pr-10">
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="group flex h-[59px] w-[59px] flex-col items-center justify-center gap-1 rounded-full border-0 transition-colors"
            style={{
              backgroundColor: menuOpen ? "#0B0B0B" : "#F4F1E8",
            }}
          >
            <span
              className={`block h-0.5 w-6 transition-all ${
                menuOpen
                  ? "translate-x-[2px] translate-y-[2px] rotate-45"
                  : ""
              }`}
              style={{
                backgroundColor: menuOpen ? "#F4F1E8" : "#111111",
              }}
            />
            <span
              className={`block h-0.5 w-6 transition-all ${
                menuOpen
                  ? "-translate-y-[2px] translate-x-[2px] -rotate-45"
                  : ""
              }`}
              style={{
                backgroundColor: menuOpen ? "#F4F1E8" : "#111111",
              }}
            />
          </button>
        </div>
      </div>

      {/* Menu panel */}
      <div
        className={`fixed z-[9] flex flex-col justify-between rounded-[20px] px-8 pb-8 pt-[90px] backdrop-blur-[26px] transition-[top,opacity] duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] md:right-[7px] md:w-[420px] md:px-[60px] md:py-[60px] ${
          menuOpen
            ? "pointer-events-auto left-2 right-2 top-0 opacity-100 md:left-auto md:top-[7px]"
            : "pointer-events-none left-2 right-2 top-[-600px] opacity-0 md:left-auto"
        }`}
        style={{ backgroundColor: "rgba(17,17,17,0.95)" }}
      >
        <nav className="flex flex-col gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={`/${item.href}`}
              onClick={() => setMenuOpen(false)}
              className="text-4xl font-medium leading-[130%] transition-opacity hover:opacity-70 md:text-[42px]"
              style={{ color: "#F4F1E8" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-5">
          <a
            href={`mailto:${contact.email}`}
            className="text-lg transition-colors md:text-xl"
            style={{ color: "#9A9590" }}
          >
            {contact.email}
          </a>
          <div className="flex flex-wrap gap-6">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-sm underline underline-offset-2 transition-opacity hover:opacity-80"
                style={{ color: "#9A9590" }}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full p-1.5"
          >
            <span className="absolute bottom-[5px] left-2 top-[5px] z-0 w-[calc(100%-8px-8px-38px-8px)] rounded-full bg-white transition-[width] duration-300 group-hover:w-[calc(100%-12px)]" />
            <span
              className="relative z-[1] whitespace-nowrap px-10 py-2 text-sm font-medium"
              style={{ color: "#111111" }}
            >
              Let&apos;s talk
            </span>
            <span
              className="relative z-[1] flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full transition-transform group-hover:-translate-x-1"
              style={{ backgroundColor: "#75C5DE" }}
            >
              <ArrowUpRight className="h-3.5 w-3.5 text-white" />
            </span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <main
        className="relative min-h-[100svh] w-full overflow-hidden md:h-screen md:min-h-[800px]"
        style={{ backgroundColor: "#E4E4E4" }}
      >
        <motion.div
          className="pointer-events-none absolute bottom-[-30px] left-0 right-0 z-[2] w-full text-center md:bottom-[-40px]"
          initial={prefersReducedMotion ? false : { y: 330 }}
          animate={{ y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1,
            delay: prefersReducedMotion ? 0 : 1.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <h2
            className="whitespace-nowrap text-[clamp(180px,28vw,560px)] font-medium leading-[80%] tracking-[-0.04em]"
            style={{ color: "#F4F1E8" }}
          >
            Visuals
          </h2>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 top-[30vh] z-[5] bg-cover bg-no-repeat md:top-0 md:bg-center"
          style={{
            backgroundImage: `url('${BASE_IMG}')`,
            backgroundPosition: "60% center",
          }}
          initial={
            prefersReducedMotion
              ? false
              : { opacity: 0, scale: 1.5, rotate: 3 }
          }
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 1.2,
            delay: prefersReducedMotion ? 0 : 1,
            ease: easeOut,
          }}
        />

        <SpotlightReveal
          className="bottom-0 left-0 right-0 top-[30vh] z-[7] md:inset-0 md:bg-center"
          style={{
            backgroundImage: `url('${REVEAL_IMG}')`,
            backgroundPosition: "60% center",
          }}
        />

        <div className="pointer-events-none relative z-[8] mx-auto flex w-full max-w-[1600px] flex-col items-start justify-start px-4 pb-6 pt-[110px] md:absolute md:inset-0 md:justify-between md:px-10 md:pb-[100px] md:pt-40">
          <div className="pointer-events-auto flex w-full flex-col items-start gap-[30px]">
            <h1
              className="max-w-[447px] text-[22px] font-medium leading-[120%] tracking-[-0.02em] md:text-[28px]"
              style={{ color: "#111111" }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  className="mr-[0.3em] inline-block"
                  initial={
                    prefersReducedMotion
                      ? false
                      : { opacity: 0, y: 10, filter: "blur(10px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.4,
                    delay: prefersReducedMotion ? 0 : 1 + i * 0.05,
                    ease: "easeOut",
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { opacity: 0, y: 60, scale: 0.4 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.8,
                delay: prefersReducedMotion ? 0 : 1,
                ease: easeOut,
              }}
            >
              <Link
                href="/#ventures"
                className="group relative flex items-center gap-3 overflow-hidden rounded-full p-2"
              >
                <span className="absolute bottom-[5px] left-2 top-[5px] z-0 w-[calc(100%-8px-8px-48px-12px)] rounded-full bg-white transition-[width] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:w-[calc(100%-16px)] md:w-[calc(100%-8px-8px-54px-12px)]" />
                <span
                  className="relative z-[1] whitespace-nowrap px-8 py-3 text-base font-medium md:px-10 md:py-4 md:text-lg"
                  style={{ color: "#111111" }}
                >
                  Start a project now
                </span>
                <span
                  className="relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:-translate-x-[7px] md:h-[54px] md:w-[54px]"
                  style={{ backgroundColor: "#75C5DE" }}
                >
                  <ArrowUpRight className="h-[18px] w-[18px] text-white" />
                </span>
              </Link>
            </motion.div>

            <p
              className="max-w-sm text-xs md:text-sm"
              style={{ color: "rgba(17,17,17,0.7)" }}
            >
              {hero.contextLabel} — {hero.description}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
