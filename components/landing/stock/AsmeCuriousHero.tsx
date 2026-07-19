"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Globe } from "lucide-react";
import LandingTopNav from "@/components/landing/LandingTopNav";

function resolveHomeHash(href: string) {
  if (href.startsWith("/") || href.startsWith("http")) return href;
  return `/${href}`;
}

/** Lucide dropped brand icons; keep prompt-faithful Instagram / X (Twitter) marks. */
function InstagramIcon({ size = 20 }: { size?: number }) {
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
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon({ size = 20 }: { size?: number }) {
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
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

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
        <a
          href="#"
          aria-label="Instagram"
          className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
        >
          <InstagramIcon size={20} />
        </a>
        <a
          href="#"
          aria-label="Twitter"
          className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
        >
          <TwitterIcon size={20} />
        </a>
        <a
          href="#"
          aria-label="Website"
          className="liquid-glass rounded-full p-4 text-white/80 transition-all hover:bg-white/5 hover:text-white"
        >
          <Globe size={20} aria-hidden />
        </a>
      </footer>
    </div>
  );
}
