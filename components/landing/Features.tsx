"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { ventures } from "@/lib/content/landing";
import WordsPullUpMultiStyle from "@/components/landing/WordsPullUpMultiStyle";

const FEATURE_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4";

const CARD_EASE = [0.22, 1, 0.36, 1] as const;

type InfoCard = Extract<(typeof ventures.cards)[number], { type: "info" }>;

function FeatureCard({
  children,
  index,
  className = "",
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial={prefersReducedMotion ? false : { scale: 0.96, opacity: 0 }}
      animate={
        prefersReducedMotion || isInView
          ? { scale: 1, opacity: 1 }
          : { scale: 0.96, opacity: 0 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.7,
              delay: index * 0.12,
              ease: CARD_EASE,
            }
      }
    >
      {children}
    </motion.div>
  );
}

function InfoCardBody({ card }: { card: InfoCard }) {
  return (
    <div className="flex h-full flex-col p-5 sm:p-6">
      <img
        src={card.icon}
        alt=""
        className="mb-4 h-10 w-10 rounded object-cover sm:h-12 sm:w-12"
      />

      <h3
        className="mb-1 text-lg font-medium leading-snug sm:text-xl"
        style={{ color: "#E1E0CC" }}
      >
        <span className="mr-2 text-sm text-primary/60">{card.number}</span>
        {card.title}
      </h3>

      <ul className="mt-4 flex flex-1 flex-col gap-2.5">
        {card.items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm leading-snug text-gray-400">{item}</span>
          </li>
        ))}
      </ul>

      {card.href.startsWith("http") ? (
        <a
          href={card.href}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80 md:min-h-0"
        >
          Learn more
          <ArrowRight
            className="h-4 w-4"
            style={{ transform: "rotate(-45deg)" }}
          />
        </a>
      ) : (
        <Link
          href={card.href}
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-primary transition-opacity hover:opacity-80 md:min-h-0"
        >
          Learn more
          <ArrowRight
            className="h-4 w-4"
            style={{ transform: "rotate(-45deg)" }}
          />
        </Link>
      )}
    </div>
  );
}

export default function Features() {
  const videoCard = ventures.cards.find((c) => c.type === "video");
  const infoCards = ventures.cards.filter(
    (c): c is InfoCard => c.type === "info",
  );

  return (
    <section
      id="ventures"
      className="relative scroll-mt-20 bg-black px-4 py-14 sm:px-6 sm:py-20 md:py-24 lg:py-28"
    >
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.12]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-8 w-full max-w-xl sm:mb-12 sm:max-w-2xl md:mb-14 md:max-w-3xl lg:max-w-4xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-primary/70 sm:mb-4 sm:text-xs">
            {ventures.eyebrow}
          </p>
          <h2 className="w-full text-left text-[1.35rem] font-normal leading-[1.25] tracking-[-0.02em] sm:text-2xl sm:leading-[1.2] md:text-3xl lg:text-4xl">
            <WordsPullUpMultiStyle
              stackLines
              className="gap-1.5 sm:gap-2"
              lineClassName="text-left"
              segments={[
                { text: ventures.line1, className: "text-primary" },
                { text: ventures.line2, className: "text-gray-500" },
              ]}
            />
          </h2>
        </header>

        <div className="flex flex-col gap-3 lg:hidden">
          {videoCard && (
            <FeatureCard
              index={0}
              className="aspect-[4/5] min-h-[280px] w-full sm:aspect-[16/10] sm:min-h-[320px]"
            >
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={FEATURE_VIDEO}
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <p
                className="absolute bottom-5 left-5 right-5 text-xl font-medium tracking-tight sm:text-2xl"
                style={{ color: "#E1E0CC" }}
              >
                {ventures.videoTitle}
              </p>
            </FeatureCard>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
            {infoCards.map((card, index) => (
              <FeatureCard
                key={card.title}
                index={index + 1}
                className="min-h-0 bg-[#212121]"
              >
                <InfoCardBody card={card} />
              </FeatureCard>
            ))}
          </div>
        </div>

        <div className="hidden h-[480px] grid-cols-4 gap-1 lg:grid">
          {ventures.cards.map((card, index) => {
            if (card.type === "video") {
              return (
                <FeatureCard key={card.title} index={index} className="h-full">
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={FEATURE_VIDEO}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p
                    className="absolute bottom-5 left-5 right-5 text-xl font-medium"
                    style={{ color: "#E1E0CC" }}
                  >
                    {card.title}
                  </p>
                </FeatureCard>
              );
            }

            return (
              <FeatureCard
                key={card.title}
                index={index}
                className="h-full bg-[#212121]"
              >
                <InfoCardBody card={card} />
              </FeatureCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
