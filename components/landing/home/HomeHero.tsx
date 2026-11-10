import { CtaLink } from "@/components/bento/Buttons";
import { AvailabilityPill } from "@/components/bento/Chips";
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { hero } from "@/lib/content/landing";

/**
 * Home hero (bento canvas, design spec 4.1; role-first since recruiter-fit
 * phase 2). The h1 is the LCP element: it paints at once, and its lines
 * (`kj-lines`) only slide up a little, never fade or blur. Each line is its
 * own block span and the last takes the accent colour. Under it: who he is
 * open to hearing from, then the two things a recruiter does next.
 */
export default function HomeHero() {
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-9">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-5">
        <h1 id="hero-title" className="kj-lines m-0 text-display text-ink">
          <span className="block">
            {hero.greeting}{" "}
            <img
              src={hero.portraitSrc}
              alt=""
              width={74}
              height={74}
              decoding="async"
              className="mx-[0.06em] inline-block size-[1.15em] rounded-[0.3em] border-[3px] border-surface object-cover align-[-0.22em] shadow-[var(--elev-avatar)]"
            />{" "}
            {hero.name}
          </span>{" "}
          {hero.headline.map((line) => (
            <span key={line} className="block">
              {line}{" "}
            </span>
          ))}
          <span className="block text-mark">{hero.headlineAccent}</span>
        </h1>
        <AvailabilityPill
          label={OPEN_TO_ROLES.pill.label}
          detail={OPEN_TO_ROLES.pill.detail}
          className="mb-2.5"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <CtaLink href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaLink>
          <CtaLink href={hero.resumeCta.href} variant="secondary">
            {hero.resumeCta.label}
          </CtaLink>
        </div>
        <p className="m-0 max-w-[470px] text-lg leading-normal text-ink-2">
          {hero.homeLead}
        </p>
      </div>
    </section>
  );
}
