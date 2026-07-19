"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Infinity, Menu, X } from "lucide-react";
import { site } from "@/lib/content/landing";

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_230229_7c9bc431-46cf-489a-948d-e8144d8eb5d4.mp4";

const navLinks = [
  { label: "Home", href: "/", active: true },
  { label: "Ventures", href: "/#ventures", dropdown: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export default function ShowcasePage() {
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
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={BG_VIDEO}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/35" />

      <nav
        className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-medium text-white"
        >
          <Infinity size={22} strokeWidth={1.5} aria-hidden />
          <span>{site.wordmark}</span>
        </Link>

        <div className="liquid-glass hidden items-center gap-1 rounded-xl px-2 py-2 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-0.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                "active" in item && item.active
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
              {"dropdown" in item && item.dropdown ? (
                <ChevronDown size={13} className="mt-px" aria-hidden />
              ) : null}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/resume"
            className="liquid-glass rounded-full px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Resume
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Begin Now
          </Link>
        </div>

        <button
          type="button"
          className="liquid-glass rounded-lg p-2 text-white md:hidden"
          aria-expanded={menuOpen}
          aria-controls="showcase-mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {menuOpen ? (
        <div
          id="showcase-mobile-nav"
          className="liquid-glass absolute top-[72px] right-4 left-4 z-30 flex flex-col gap-1 rounded-2xl p-4 md:hidden"
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm transition-colors ${
                "active" in item && item.active
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              {"dropdown" in item && item.dropdown ? (
                <ChevronDown size={13} aria-hidden />
              ) : null}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
            <Link
              href="/resume"
              onClick={() => setMenuOpen(false)}
              className="liquid-glass flex-1 rounded-full px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Resume
            </Link>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-center text-sm font-medium text-black transition-colors hover:bg-white/90"
            >
              Begin Now
            </Link>
          </div>
        </div>
      ) : null}

      <main
        id="main"
        className="absolute bottom-0 left-0 z-20 max-w-2xl px-6 pb-10 sm:px-12 sm:pb-16"
      >
        <h1 className="mb-4 text-4xl leading-tight font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
          Live Better, Feel Whole Every Day
        </h1>
        <p className="mb-7 max-w-md text-sm leading-relaxed text-white/60">
          Take charge of how you feel with a companion built for your
          journey—build routines, follow your growth, and unlock tailored
          insights for a steadier, more vibrant life each day.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/#ventures"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90 sm:px-7 sm:text-base"
          >
            Start Today
          </Link>
          <Link
            href="/about"
            className="liquid-glass rounded-full px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5 sm:px-7 sm:text-base"
          >
            Discover How
          </Link>
        </div>
      </main>
    </div>
  );
}
