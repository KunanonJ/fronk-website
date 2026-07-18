"use client";

/**
 * Client-only GSAP registration. Import from client components only.
 * ScrollTrigger is registered only when motion is allowed.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsapPlugins } from "@/lib/motion/motionRuntime";

let registered = false;

export function ensureGsap(): typeof gsap {
  if (!registered && typeof window !== "undefined") {
    registered = registerGsapPlugins(gsap, [ScrollTrigger]);
  }
  return gsap;
}

export { ScrollTrigger };
