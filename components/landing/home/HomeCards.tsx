import { useState } from "react";
import { BentoCard, CardLink } from "@/components/bento/Bento";
import { Segmented } from "@/components/bento/Segmented";
import { aboutPage } from "@/lib/content/aboutPage";
import { ventures } from "@/lib/content/landing";
import { getFeaturedPortfolioProjects } from "@/lib/content/portfolio";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import { homeExperience } from "@/lib/landing/experience";
import { cn } from "@/lib/utils/cn";

/*
 * Home bento cards (bento canvas, design spec 4.1). Copy comes from the
 * content modules; only the card labels are canvas microcopy.
 */

/**
 * Experience: the first four résumé roles on a timeline, the current role's
 * dot in the accent colour, fading out at the bottom. Reads the résumé
 * fallback in the repo, so Home stays prerendered with no Sanity fetch.
 */
export function ExperienceCard() {
  const entries = homeExperience(RESUME_TIMELINE_FALLBACK);
  return (
    <BentoCard headingId="card-experience" title="Experience">
      {/* The line is a pseudo-element 4 px inside the list box, so the fade
          mask (which clips to the box) never cuts the dots on it. */}
      <ol className="relative m-0 -ml-1 flex list-none flex-col gap-[18px] p-0 pl-[27px] [mask-image:linear-gradient(to_bottom,black_72%,transparent)] before:absolute before:inset-y-0 before:left-1 before:w-px before:bg-hairline-strong">
        {entries.map((entry, index) => (
          <li key={entry.title} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute top-1.5 -left-[27px] size-[9px] rounded-full",
                index === 0 ? "bg-mark" : "bg-ink",
              )}
            />
            <p className="m-0 text-card font-medium">{entry.title}</p>
            <p className="mt-0.5 text-meta text-ink-2">{entry.meta}</p>
          </li>
        ))}
      </ol>
      <CardLink href="/resume" corner>
        Résumé →
      </CardLink>
    </BentoCard>
  );
}

/**
 * Ventures: both logos, tilted. `id="ventures"` keeps /#ventures (the menu,
 * the 404 page and the /ventures redirect) landing here.
 */
export function VenturesCard() {
  const [gogocash, manut] = ventures.cards;
  return (
    <BentoCard
      id="ventures"
      headingId="card-ventures"
      title={ventures.eyebrow}
      gap={0}
      className="scroll-mt-6"
    >
      <div aria-hidden className="relative mt-2.5 h-[140px]">
        <img
          src={gogocash.icon}
          alt=""
          width={112}
          height={112}
          loading="lazy"
          decoding="async"
          className="absolute top-2.5 left-1/2 -ml-[104px] size-28 -rotate-8 rounded-[26px] border-4 border-surface shadow-logo"
        />
        <img
          src={manut.icon}
          alt=""
          width={112}
          height={112}
          loading="lazy"
          decoding="async"
          className="absolute top-1.5 left-1/2 -ml-2 size-28 rotate-7 rounded-[26px] border-4 border-surface object-cover shadow-logo"
        />
      </div>
      <p className="mt-1.5 text-center text-base font-semibold">
        {gogocash.title} · {manut.title}
      </p>
      <p className="mt-1 text-center text-meta text-ink-2">
        {gogocash.items[0]} · {gogocash.items[1]} on {gogocash.title}
      </p>
      <CardLink href="/#ventures" className="mt-auto self-center">
        See both ventures →
      </CardLink>
    </BentoCard>
  );
}

/** Selected work: the featured projects, numbered, in the canvas order. */
export function SelectedWorkCard() {
  const projects = getFeaturedPortfolioProjects();
  return (
    <BentoCard headingId="card-work" title="Selected work" gap={3}>
      <ul className="m-0 mt-1 flex list-none flex-col p-0">
        {projects.map((project, index) => (
          <li
            key={project.slug}
            className="flex gap-3 border-b border-hairline py-[9px] last:border-b-0"
          >
            <span className="pt-[3px] font-mono text-xs text-ink-2">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex flex-col">
              <span className="text-card font-medium">{project.name}</span>
              <span className="text-meta text-ink-2">{project.tagline}</span>
            </span>
          </li>
        ))}
      </ul>
      <CardLink href="/portfolio" className="mt-auto self-end">
        All work →
      </CardLink>
    </BentoCard>
  );
}

/** How I work: a four-step stepper over the operating principles. */
export function HowIWorkCard() {
  const principles = aboutPage.principles.items;
  const [step, setStep] = useState(0);
  const current = principles[step] ?? principles[0]!;
  const number = String(step + 1).padStart(2, "0");
  return (
    <BentoCard headingId="card-how" title="How I work" gap={3.5}>
      <div aria-live="polite" className="mt-auto flex flex-col gap-2.5 px-1">
        <p className="m-0 text-[22px] leading-snug font-semibold tracking-[-0.02em]">
          <span className="mr-2.5 font-mono text-mark">{number}</span>
          {current.title}
        </p>
        <p className="m-0 max-w-[560px] text-card leading-[1.55] text-ink-2">
          {current.body}
        </p>
      </div>
      <Segmented
        label="Operating principles"
        value={String(step)}
        onChange={(value) => setStep(Number(value))}
        options={principles.map((_, index) => ({
          label: `Step ${String(index + 1).padStart(2, "0")}`,
          value: String(index),
        }))}
      />
    </BentoCard>
  );
}
