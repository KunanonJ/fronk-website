"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type CSSProperties } from "react";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: CSSProperties;
}

export default function WordsPullUp({
  text,
  className = "",
  showAsterisk = false,
  style,
}: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <span
      ref={ref}
      className={`inline whitespace-normal break-words ${className}`}
      style={style}
    >
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span
            key={`${word}-${i}`}
            className="mr-[0.28em] inline-block overflow-hidden align-baseline last:mr-0"
          >
            <motion.span
              className="relative inline-block"
              initial={prefersReducedMotion ? false : { y: 20, opacity: 0 }}
              animate={
                prefersReducedMotion || isInView
                  ? { y: 0, opacity: 1 }
                  : { y: 20, opacity: 0 }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            >
              {word}
              {showAsterisk && isLast && (
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em] leading-none">
                  *
                </span>
              )}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
