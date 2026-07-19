"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  /** Stack each segment on its own line (default true). */
  stackLines?: boolean;
  lineClassName?: string;
}

export default function WordsPullUpMultiStyle({
  segments,
  className = "",
  stackLines = true,
  lineClassName = "",
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();

  let wordIndex = 0;

  if (!stackLines) {
    const words = segments.flatMap((segment) =>
      segment.text.split(/\s+/).filter(Boolean).map((word) => ({
        word,
        className: segment.className ?? "",
      })),
    );

    return (
      <div
        ref={ref}
        className={`w-full whitespace-normal break-words ${className}`}
      >
        {words.map(({ word, className: wordClass }, i) => {
          const delayIndex = wordIndex++;
          return (
            <span
              key={`${word}-${i}`}
              className="mr-[0.28em] inline-block overflow-hidden align-baseline last:mr-0"
            >
              <motion.span
                className={`inline-block ${wordClass}`}
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
                        delay: delayIndex * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }
                }
              >
                {word}
              </motion.span>
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={`flex w-full flex-col ${className}`}>
      {segments.map((segment, sIdx) => {
        const words = segment.text.split(/\s+/).filter(Boolean);

        return (
          <span
            key={`line-${sIdx}`}
            className={`block w-full whitespace-normal break-words ${lineClassName}`}
          >
            {words.map((word, i) => {
              const delayIndex = wordIndex++;
              return (
                <span
                  key={`${word}-${sIdx}-${i}`}
                  className="mr-[0.28em] inline-block overflow-hidden align-baseline last:mr-0"
                >
                  <motion.span
                    className={`inline-block ${segment.className ?? ""}`}
                    initial={
                      prefersReducedMotion ? false : { y: 20, opacity: 0 }
                    }
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
                            delay: delayIndex * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }
                    }
                  >
                    {word}
                  </motion.span>
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}
