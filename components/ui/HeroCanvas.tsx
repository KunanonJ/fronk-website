"use client";

export function HeroCanvas() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-20 h-full w-full opacity-40 dark:opacity-25"
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--border) 1px, transparent 1px),
          linear-gradient(to bottom, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }}
    />
  );
}
