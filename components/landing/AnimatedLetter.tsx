"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, type RefObject } from "react";

interface AnimatedLetterProps {
  children: string;
  index: number;
  totalChars: number;
  containerRef: RefObject<HTMLElement | null>;
}

export default function AnimatedLetter({
  children,
  index,
  totalChars,
  containerRef,
}: AnimatedLetterProps) {
  const letterRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const charProgress = index / Math.max(totalChars - 1, 1);
  const opacity = useTransform(
    scrollYProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1],
  );

  if (prefersReducedMotion) {
    return <span>{children === " " ? "\u00A0" : children}</span>;
  }

  return (
    <motion.span ref={letterRef} style={{ opacity }} className="inline">
      {children === " " ? "\u00A0" : children}
    </motion.span>
  );
}
