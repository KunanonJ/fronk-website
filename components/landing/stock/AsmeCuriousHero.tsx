"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import LandingTopNav from "@/components/landing/LandingTopNav";
import { socials } from "@/lib/content/landing";

function resolveHomeHash(href: string) {
  if (href.startsWith("/") || href.startsWith("http")) return href;
  return `/${href}`;
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const ABOUT_SOCIALS = [
  { label: "X", href: socials[0].href, Icon: XIcon },
  { label: "LinkedIn", href: socials[1].href, Icon: LinkedinIcon },
  { label: "GitHub", href: socials[2].href, Icon: GithubIcon },
] as const;

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4";

const FADE_MS = 500;
const FADE_OUT_LEAD_S = 0.55;
const LOOP_RESET_DELAY_MS = 100;

/**
 * About hero: Asme / "Built for the curious".
 * Primary IA route: `/about` (legacy `/stock/asme` redirects here).
 */
export default function AsmeCuriousHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadingOutRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const opacityRef = useRef(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const cancelFade = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const fadeTo = (target: number, durationMs: number) => {
      cancelFade();
      const el = videoRef.current;
      if (!el) return;
      const start = performance.now();
      const from = opacityRef.current;

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const value = from + (target - from) * t;
        opacityRef.current = value;
        el.style.opacity = String(value);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
          opacityRef.current = target;
          el.style.opacity = String(target);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const fadeIn = () => {
      fadingOutRef.current = false;
      fadeTo(1, FADE_MS);
    };

    const onTimeUpdate = () => {
      if (fadingOutRef.current || !Number.isFinite(video.duration)) return;
      if (video.duration - video.currentTime <= FADE_OUT_LEAD_S) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };

    const onEnded = () => {
      cancelFade();
      opacityRef.current = 0;
      video.style.opacity = "0";
      window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => {
          /* autoplay may be blocked after manual pause */
        });
        fadeIn();
      }, LOOP_RESET_DELAY_MS);
    };

    video.style.opacity = "0";
    opacityRef.current = 0;

    video.addEventListener("loadeddata", fadeIn);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 2) fadeIn();

    return () => {
      cancelFade();
      video.removeEventListener("loadeddata", fadeIn);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 h-full w-full translate-y-[17%] object-cover"
        src={BG_VIDEO}
        autoPlay
        muted
        playsInline
        // Custom JS loop + fade — do not use the loop attribute.
      />

      <LandingTopNav
        wordmarkHref="/"
        resolveHref={resolveHomeHash}
        navId="stock-asme-mobile-nav"
      />

      <main
        id="main"
        className="relative z-10 flex flex-1 -translate-y-[20%] flex-col items-center justify-center px-6 py-12 pt-24 text-center"
      >
        <h1
          className="mb-8 text-5xl tracking-tight whitespace-nowrap text-white md:text-6xl lg:text-7xl"
          style={{
            fontFamily:
              "var(--font-instrument-serif), 'Instrument Serif', serif",
          }}
        >
          Built for the curious
        </h1>

        <div className="w-full max-w-xl space-y-4">
          <form
            className="liquid-glass flex items-center gap-3 rounded-full py-2 pr-2 pl-6"
            onSubmit={onSubscribe}
          >
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="rounded-full bg-white p-3 text-black transition-colors hover:bg-white/90"
              aria-label="Subscribe"
            >
              <ArrowRight size={20} aria-hidden />
            </button>
          </form>

          <p className="px-4 text-sm leading-relaxed text-white">
            Stay updated with the latest news and insights. Subscribe to our
            newsletter today and never miss out on exciting updates.
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              className="liquid-glass rounded-full px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white/5"
            >
              Manifesto
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        {ABOUT_SOCIALS.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
          >
            <Icon size={20} />
          </a>
        ))}
      </footer>
    </div>
  );
}
