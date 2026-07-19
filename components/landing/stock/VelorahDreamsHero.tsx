"use client";

const BG_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const NAV_LINKS = [
  { label: "Home", active: true },
  { label: "Studio" },
  { label: "About" },
  { label: "Journal" },
  { label: "Reach Us" },
] as const;

/**
 * Design-stock hero: Velorah / "Where dreams rise through the silence."
 * Not wired into primary IA — preview at `/stock/velorah`.
 */
export default function VelorahDreamsHero() {
  return (
    <div className="stock-velorah relative min-h-screen overflow-hidden">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={BG_VIDEO}
        autoPlay
        loop
        muted
        playsInline
      />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <div
          className="text-3xl tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Velorah<sup className="text-xs">®</sup>
        </div>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`text-sm transition-colors hover:text-foreground ${
                "active" in item && item.active
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="liquid-glass cursor-pointer rounded-full px-6 py-2.5 text-sm text-foreground transition-transform hover:scale-[1.03]"
        >
          Begin Journey
        </button>
      </header>

      <main
        id="main"
        className="relative z-10 flex flex-col items-center px-6 py-[90px] pt-32 pb-40 text-center"
      >
        <h1
          className="animate-fade-rise max-w-7xl text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-foreground sm:text-7xl md:text-8xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Where <em className="not-italic text-muted-foreground">dreams</em>{" "}
          rise{" "}
          <em className="not-italic text-muted-foreground">
            through the silence.
          </em>
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          We&apos;re designing tools for deep thinkers, bold creators, and quiet
          rebels. Amid the chaos, we build digital spaces for sharp focus and
          inspired work.
        </p>

        <button
          type="button"
          className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-foreground transition-transform hover:scale-[1.03]"
        >
          Begin Journey
        </button>
      </main>
    </div>
  );
}
