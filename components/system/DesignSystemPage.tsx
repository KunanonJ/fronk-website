import { useState } from "react";
import {
  Bento,
  BentoCard,
  CardLink,
  CardTitle,
  PageMain,
  Well,
} from "@/components/bento/Bento";
import { CtaLink } from "@/components/bento/Buttons";
import {
  EyebrowChip,
  LivePill,
  MetaTag,
  TechChip,
} from "@/components/bento/Chips";
import { MonoEyebrow } from "@/components/bento/MonoEyebrow";
import { Segmented } from "@/components/bento/Segmented";
import CopyButton from "@/components/landing/skills/CopyButton";
import { PixelGrid } from "@/components/ui/PixelGrid";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils/cn";

/*
 * /design (bento redesign, phase 7g; no canvas page, design spec 6): the
 * bento system on one page, for screenshot review in both themes. Unlinked
 * and noindex. Every sample is the live component, so the page drifts with
 * the system, not away from it.
 */

const LABEL = "font-mono text-xs tracking-[0.06em] text-ink-2 uppercase";

/** Colour roles: the Tailwind class, the token, and what it is for. */
const SWATCHES = [
  ["bg-page", "--page", "Page"],
  ["bg-surface", "--surface", "Cards"],
  ["bg-surface-tint", "--surface-tint", "Tint, wells"],
  ["bg-ink", "--ink", "Text"],
  ["bg-ink-2", "--ink-2", "Secondary text"],
  ["bg-ink-3", "--muted", "Display connectors"],
  ["bg-mark", "--accent", "Links, markers"],
  ["bg-cta", "--cta", "Primary buttons"],
  ["bg-ember", "--ember", "Live, failed"],
  ["bg-hairline-strong", "--hairline-strong", "Borders"],
  ["bg-(--map)", "--map", "Map art"],
  ["bg-(--river)", "--river", "River art"],
] as const;

/** Drawn as one corner of a 56 px square, so the sizes read apart. */
const RADII = [
  ["rounded-tl-bento", "28", "Cards"],
  ["rounded-tl-sheet", "24", "Panels"],
  ["rounded-tl-well", "20", "Wells"],
  ["rounded-tl-row", "14", "Menu rows"],
  ["rounded-tl-tile", "12", "Tiles"],
  ["rounded-tl-full", "999", "Pills"],
] as const;

const TYPE = [
  ["text-display", "Home h1", "Building from Bangkok"],
  ["text-title", "Page h1", "Selected work"],
  ["text-lg", "Lead, 18 px", "Founder of GoGoCash and Manut AI."],
  [
    "text-card",
    "Card body, 15 px",
    "One back office for a multi-entity group.",
  ],
  ["text-meta", "Kicker, 13 px", "Experience"],
] as const;

/** Motion (design spec 2): what moves, how long, on which curve. */
const MOTION = [
  ["Card entrance", ".9s soft ease, .16s then +.08s per card (to .64s)"],
  ["h1 lines", "1s slide only: the LCP heading never fades or blurs"],
  ["Card hover", "lift 4 px, pop shadow and stronger hairline, .55s"],
  ["Primary button hover", "lift 2 px and pop shadow, .35s spring"],
  ["Rows", "nudge 4 px right on hover, .4s"],
  ["Header panels", "pop from the top right, .42s; menu rows .03s apart"],
  ["Theme switch", "circular reveal from the click, .8s (view transition)"],
  ["Press", "scale .97 on every link and button"],
  ["Reduced motion", "every animation and transition off"],
] as const;

function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-wrap items-end justify-between gap-6"
    >
      <div className="flex flex-col items-start gap-[22px]">
        <MonoEyebrow>Internal</MonoEyebrow>
        <h1 id="hero-title" className="m-0 text-title text-ink">
          Design system
        </h1>
        <p className="m-0 max-w-[620px] text-lg leading-[1.55] text-ink-2">
          The bento canvas as built: tokens, type, buttons, chips, cards and
          motion. Switch the theme to review night.
        </p>
      </div>
      <ThemeToggle />
    </section>
  );
}

function ColourCard() {
  return (
    <BentoCard
      headingId="card-colour"
      title="Colour"
      span={3}
      minHeight={false}
    >
      <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-5 p-0 min-[641px]:grid-cols-4 lg:grid-cols-6">
        {SWATCHES.map(([cls, token, role]) => (
          <li key={token} className="flex min-w-0 flex-col gap-2">
            <span
              aria-hidden
              className={cn("h-16 rounded-tile border border-hairline", cls)}
            />
            <span className="font-mono text-xs [overflow-wrap:anywhere] text-ink">
              {token}
            </span>
            <span className="text-meta text-ink-2">{role}</span>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

function TypeCard() {
  return (
    <BentoCard headingId="card-type" title="Type" span={2} minHeight={false}>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {TYPE.map(([cls, role, sample]) => (
          <li key={cls} className="flex min-w-0 flex-col gap-1">
            <span className={LABEL}>
              {role} · {cls}
            </span>
            <span className={cn(cls, "text-ink")}>{sample}</span>
          </li>
        ))}
        <li className="flex flex-col gap-1">
          <span className={LABEL}>Label · Geist Mono 12 px</span>
          <span className={LABEL}>Showing 4 of 4</span>
        </li>
      </ul>
    </BentoCard>
  );
}

function RadiiCard() {
  return (
    <BentoCard headingId="card-radii" title="Radii" minHeight={false}>
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
        {RADII.map(([cls, px, role]) => (
          <li key={cls} className="flex items-center gap-3">
            <span
              aria-hidden
              className={cn(
                "size-14 shrink-0 border-t-2 border-l-2 border-mark bg-surface-tint",
                cls,
              )}
            />
            <span className="flex flex-col">
              <span className="font-mono text-xs text-ink">{px}</span>
              <span className="text-meta text-ink-2">{role}</span>
            </span>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}

function ButtonsCard() {
  return (
    <BentoCard
      headingId="card-buttons"
      title="Buttons"
      span={2}
      minHeight={false}
    >
      <p className="m-0 text-card text-ink-2">
        Primary is ink (--cta on --oncta): Ink by day, Glaze by night. The
        accent stays for links and markers.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <CtaLink href="/contact">Contact me</CtaLink>
        <CtaLink href="/portfolio" variant="secondary">
          See my work
        </CtaLink>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <CtaLink href="/contact" size="md">
          Send message
        </CtaLink>
        <CtaLink href="/resume" size="sm" variant="secondary">
          Résumé
        </CtaLink>
        <CopyButton
          text="fronk.kunanon@gmail.com"
          accessibleLabel="Copy the sample email address"
          announcement="Copied the sample email address"
        />
        <CardLink href="/about">Text link →</CardLink>
      </div>
    </BentoCard>
  );
}

function ChipsCard() {
  return (
    <BentoCard headingId="card-chips" title="Chips" minHeight={false}>
      <div className="flex flex-col items-start gap-3">
        <EyebrowChip>Eyebrow</EyebrowChip>
        <MonoEyebrow>Mono eyebrow</MonoEyebrow>
        <LivePill status="Building" />
        <div className="flex flex-wrap gap-2">
          <MetaTag marked>Original</MetaTag>
          <MetaTag>Runs automatically</MetaTag>
          <TechChip>TypeScript</TechChip>
        </div>
      </div>
    </BentoCard>
  );
}

const SEGMENTS = [
  { value: "all", label: "All · 4" },
  { value: "feature", label: "Feature · 1" },
  { value: "product", label: "Product · 2" },
] as const;

function ControlsCard() {
  const [segment, setSegment] = useState<string>("all");
  const [chip, setChip] = useState<string | null>("AI");
  return (
    <BentoCard
      headingId="card-controls"
      title="Filters"
      span={2}
      minHeight={false}
    >
      <p className="m-0 text-card text-ink-2">
        Pressed buttons in a labelled group, not tabs. List filters keep their
        value in the URL.
      </p>
      <Segmented
        label="Segmented sample"
        options={SEGMENTS}
        value={segment}
        onChange={setSegment}
        className="self-start"
      />
      <div
        role="group"
        aria-label="Toggle chip sample"
        className="flex flex-wrap gap-1.5"
      >
        {["AI", "ERP", "SME"].map((name) => {
          const on = chip === name;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => setChip(on ? null : name)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-3.5 text-sm font-medium",
                on
                  ? "border-cta bg-cta text-on-cta"
                  : "border-hairline-strong bg-surface text-ink",
              )}
            >
              {name}
            </button>
          );
        })}
      </div>
    </BentoCard>
  );
}

function CardAnatomy() {
  return (
    <BentoCard headingId="card-anatomy" title="Card" minHeight={false}>
      <CardTitle>An in-card title</CardTitle>
      <p className="m-0 text-card text-ink-2">
        A kicker h2 labels the article; wells sit on the page colour inside.
      </p>
      <Well className="font-mono text-xs text-ink-2">Inner well</Well>
      <CardLink href="/" className="mt-auto self-start">
        Card link →
      </CardLink>
    </BentoCard>
  );
}

function ArtCard() {
  return (
    <BentoCard headingId="card-art" title="Pixel art" minHeight={false}>
      <PixelGrid cols={12} rows={8} seed={404} state="failed" />
      <p className="m-0 text-meta text-ink-2">
        Accent, river and Ember squares. Ember only with a word: live or failed.
      </p>
    </BentoCard>
  );
}

function MotionCard() {
  return (
    <BentoCard
      headingId="card-motion"
      title="Motion"
      span={2}
      minHeight={false}
    >
      <dl className="m-0 grid grid-cols-1 gap-x-8 min-[641px]:grid-cols-2">
        {MOTION.map(([what, how]) => (
          <div
            key={what}
            className="flex flex-col gap-1 border-t border-hairline py-3"
          >
            <dt className={LABEL}>{what}</dt>
            <dd className="m-0 text-card text-ink">{how}</dd>
          </div>
        ))}
      </dl>
    </BentoCard>
  );
}

export default function DesignSystemPage() {
  return (
    <PageMain>
      <Hero />
      {/* Dense, so the narrow cards fill the gaps at two columns. */}
      <Bento dense>
        <ColourCard />
        <TypeCard />
        <RadiiCard />
        <ButtonsCard />
        <ChipsCard />
        <ControlsCard />
        <CardAnatomy />
        <ArtCard />
        <MotionCard />
      </Bento>
    </PageMain>
  );
}
