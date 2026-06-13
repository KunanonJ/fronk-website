"use client";

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

// `three` lives in this lazily-loaded chunk — it never ships on first paint,
// and (because of the reduced-motion gate below) never loads at all for
// reduced-motion users.
const HeroField = dynamic(
  () => import("./HeroField").then((m) => m.HeroField),
  { ssr: false },
);

const GRID_STYLE: CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
  backgroundSize: "56px 56px",
  maskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
  WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 72%)",
};

/** Static schematic backdrop — first paint and the reduced-motion fallback. */
function StaticField() {
  return (
    <div aria-hidden className="absolute inset-0 opacity-60" style={GRID_STYLE} />
  );
}

/**
 * Decorative hero backdrop. Renders the static schematic grid on first paint
 * and for reduced-motion users; swaps in the WebGL systems field once the
 * client confirms motion is allowed.
 */
export function HeroBackdrop() {
  const prefersReduced = useReducedMotion();
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      {prefersReduced ? <StaticField /> : <HeroField />}
    </div>
  );
}
