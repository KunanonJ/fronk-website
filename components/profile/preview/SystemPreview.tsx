import type { ReactNode } from "react";
import { CopyIcon } from "@/components/bento/icons";
import { CtaArrow, Pill, pillClass } from "@/components/ds/Pill";
import {
  Badge,
  Chip,
  EyebrowRow,
  PixelMark,
  StatusDot,
} from "@/components/ds/labels";
import { Tile } from "@/components/ds/layout";
import { TextLink } from "@/components/ds/TextLink";
import { Marquee } from "@/components/ds/Marquee";
import { DitherField } from "@/components/ds/DitherField";
import { Reveal } from "@/components/ds/Reveal";
import { Notebook } from "@/components/profile/home/Notebook";
import { SAMPLE_NOTES } from "@/components/profile/preview/sampleNotes";

/*
 * /preview/system (profile redesign, Phase 0): every token, type style and
 * primitive of the new design, for review in both themes and for the visual
 * baselines. Swatches paint tokens, never raw values. Copy is the site's own
 * wording or marked as a sample; no figures appear here.
 */

const PALETTE: readonly [string, string][] = [
  ["--ink", "Ink"],
  ["--paper", "Paper"],
  ["--paper-2", "Paper 2"],
  ["--paper-3", "Paper 3"],
  ["--accent", "Accent"],
  ["--accent-ink", "Accent ink"],
  ["--accent-deep", "Accent deep"],
  ["--accent-soft", "Accent soft"],
  ["--coral", "Coral"],
  ["--coral-deep", "Coral deep"],
  ["--peach", "Peach"],
  ["--tint-1", "Tint 1"],
  ["--tint-2", "Tint 2"],
  ["--tint-3", "Tint 3"],
  ["--tint-4", "Tint 4"],
  ["--tint-coral", "Tint coral"],
];

/** Ink mixes shown as what each is for: text, large text, or marks. */
const INK_TEXT: readonly [string, string][] = [
  ["--ink-80", "Ink 80: prose"],
  ["--muted-strong", "Ink 68: card summaries"],
  ["--ink-60", "Ink 60: the small-text floor"],
];
const INK_MARKS: readonly [string, string][] = [
  ["--ink-45", "Ink 45: input borders, never text"],
  ["--ink-30", "Ink 30: decoration only"],
];

const MATERIAL_HUES = [253, 79, 292, 327, 266, 301] as const;

const WASHES: readonly [string, string][] = [
  ["--sunset", "Sunset (hero)"],
  ["--dusk", "Dusk"],
  ["--sunset-strong", "Sunset strong"],
  ["--footer-sheet", "Footer sheet"],
  ["--stats-wash", "Stats tile"],
];

const TYPE: readonly [string, string, ReactNode][] = [
  ["t-hero", "Hero (Home h1)", "Forward deployed AI engineering from Bangkok."],
  ["t-display", "Display (page h1)", "TBH Intranet."],
  ["t-title", "Title (section h2)", "Selected work"],
  ["t-footer", "Footer headline", "Say hello"],
  [
    "t-statement",
    "Statement, with an italic accent",
    <>
      Sample statement line <span className="t-italic">from Bangkok</span>
    </>,
  ],
  ["t-h3", "H3, chapter headings", "Sample chapter heading"],
  ["t-card-title", "Stack card title", "AI Automation"],
  [
    "t-lead",
    "Lead",
    "IT Manager & AI Engineering Lead at The Binary Holdings. Also building GoGoCash and Manut AI.",
  ],
  [
    "t-body",
    "Body, 17 px",
    "Sample body copy at 17 px on 1.55 lines, wrapped so no line ends on a single word.",
  ],
  [
    "t-prose",
    "Case-study prose, 17 px on 1.7",
    "Sample prose for a case study, held to 64 characters a line in ink at 80%.",
  ],
  ["t-small", "Small, 14 px", "Sample caption under a showcase tile."],
  ["t-meta", "Meta, 12 px mono (the floor)", "Selected work"],
  ["t-kicker", "Kicker", "02 / What it does"],
  ["t-nav", "Nav, 15 px", "Work"],
  ["t-item", "Phone menu item, 19 px", "Résumé"],
  ["t-meta-value", "Meta value, 16 px", "Sample value"],
  ["t-lift-title", "More-projects title, 22 px", "Manut AI"],
  ["t-quote", "Notebook quote", "Sample note one."],
];

const RADII = [
  "--radius-tag",
  "--radius-tile",
  "--radius-row",
  "--radius-mat",
  "--radius-snug",
  "--radius-well",
  "--radius-sheet",
  "--radius-bento",
] as const;

const SHADOWS = [
  "--elev-ring",
  "--elev-soft",
  "--elev-lift",
  "--elev-nav",
  "--elev-pop",
  "--elev-frame",
  "--elev-float",
  "--elev-mat",
  "--elev-stage",
] as const;

const WORDMARKS = [
  "Sample wordmark",
  "Another sample",
  "Third sample",
  "Fourth sample",
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8 py-12">
      <EyebrowRow as="h2" id={id}>
        {title}
      </EyebrowRow>
      {children}
    </section>
  );
}

function Swatch({
  token,
  label,
  material,
}: {
  token?: string;
  label: string;
  material?: number;
}) {
  const background = material
    ? `linear-gradient(160deg, var(--material-${material}-a), var(--material-${material}-b))`
    : `var(${token})`;
  return (
    <li className="flex min-w-0 flex-col gap-2">
      <span
        aria-hidden="true"
        className="block h-16 rounded-[16px]"
        style={{ background, boxShadow: "var(--elev-ring)" }}
      />
      <span className="t-small">{label}</span>
      {token ? (
        <code className="t-meta break-all normal-case text-ink-2">{token}</code>
      ) : null}
    </li>
  );
}

function Specimen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="t-meta text-ink-2">{title}</h3>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}

export default function SystemPreview() {
  return (
    <div className="ds-wrap pb-24 pt-6">
      <header className="flex flex-col gap-6 pb-6">
        <EyebrowRow>Phase 0 · tokens and primitives</EyebrowRow>
        <h1 className="t-display">Design system preview</h1>
        <p className="t-lead max-w-[34em] text-ink-80">
          Everything the profile redesign builds with, in both themes. Switch
          the theme above. Under reduced motion every part stays still and
          complete.
        </p>
      </header>

      <Section id="colour" title="Colour">
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
          {PALETTE.map(([token, label]) => (
            <Swatch key={token} token={token} label={label} />
          ))}
        </ul>
        <h3 className="t-h3">Ink on paper</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INK_TEXT.map(([token, label]) => (
            <li
              key={token}
              className="t-body"
              style={{ color: `var(${token})` }}
            >
              {label}
            </li>
          ))}
          <li className="t-statement" style={{ color: "var(--muted)" }}>
            Ink 52: 24 px and up
          </li>
          {INK_MARKS.map(([token, label]) => (
            <li key={token} className="flex flex-col gap-2">
              <span
                aria-hidden="true"
                className="block h-1 rounded-full"
                style={{ background: `var(${token})` }}
              />
              <span className="t-small text-ink-2">{label}</span>
            </li>
          ))}
        </ul>
        <h3 className="t-h3">Case-card materials</h3>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {MATERIAL_HUES.map((hue) => (
            <Swatch key={hue} material={hue} label={`Hue ${hue}`} />
          ))}
        </ul>
        <h3 className="t-h3">Washes</h3>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {WASHES.map(([token, label]) => (
            <Swatch key={token} token={token} label={label} />
          ))}
        </ul>
      </Section>

      <Section id="type" title="Type">
        <ul className="flex flex-col gap-8">
          {TYPE.map(([className, label, sample]) => (
            <li key={className} className="flex flex-col gap-2">
              <span className="t-meta text-ink-2">
                {label} · <code className="normal-case">.{className}</code>
              </span>
              <p className={className}>{sample}</p>
            </li>
          ))}
          <li className="flex flex-col gap-2">
            <span className="t-meta text-ink-2">
              Thai: Noto Sans Thai, no capitals or tracking on labels
            </span>
            <p lang="th" className="t-body">
              สวัสดีครับ จากกรุงเทพฯ
            </p>
            <p lang="th" className="t-meta">
              ภาษาไทย
            </p>
          </li>
        </ul>
      </Section>

      <Section id="shape" title="Shape and depth">
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
          {RADII.map((token) => (
            <li key={token} className="flex flex-col gap-2">
              <span
                aria-hidden="true"
                className="block h-16 bg-tint-2"
                style={{ borderRadius: `var(${token})` }}
              />
              <code className="t-meta break-all normal-case text-ink-2">
                {token}
              </code>
            </li>
          ))}
        </ul>
        <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {SHADOWS.map((token) => (
            <li key={token} className="flex flex-col gap-3">
              <span
                aria-hidden="true"
                className="block h-20 rounded-[20px] bg-page"
                style={{ boxShadow: `var(${token})` }}
              />
              <code className="t-meta break-all normal-case text-ink-2">
                {token}
              </code>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="primitives" title="Primitives">
        <Specimen title="Pills: hero pair, nav, footer, small, round, off-site">
          <Pill href="/contact" size="hero" arrow="swap">
            Contact me
          </Pill>
          <Pill href="/resume" variant="ghost" size="hero">
            Résumé
          </Pill>
          <Pill size="nav" arrow="swap">
            Say hello
          </Pill>
          <Pill size="lg">Say hello</Pill>
          <Pill variant="ghost" size="sm">
            Read the story
          </Pill>
          <Pill round variant="ghost" icon={<CopyIcon size={16} />}>
            Copy email
          </Pill>
          <Pill href="https://github.com" external variant="ghost">
            GitHub
          </Pill>
        </Specimen>

        <Specimen title="Badge and chips">
          <Badge>Open to roles</Badge>
          <Chip>Bangkok or remote</Chip>
          <Chip>Forward Deployed Engineer</Chip>
          <span
            className="relative block h-24 w-40 rounded-[16px]"
            style={{
              background:
                "linear-gradient(160deg, var(--material-253-a), var(--material-253-b))",
            }}
          >
            <Chip kind="illustration">Illustration</Chip>
          </span>
        </Specimen>

        <div className="flex flex-col gap-4">
          <h3 className="t-meta text-ink-2">Eyebrow rows</h3>
          <EyebrowRow>Selected work</EyebrowRow>
          <EyebrowRow centred>Notes</EyebrowRow>
        </div>

        <Specimen title="Marks">
          <p className="t-kicker flex items-center gap-2 text-ink-2">
            <PixelMark />
            <span>01 / The problem</span>
          </p>
          <p className="t-small flex items-center gap-2 text-ink-2">
            <StatusDot />
            Case study · live marker, pings once
          </p>
          <p className="t-small flex items-center gap-2 text-ink-2">
            <StatusDot plain />
            Open to roles
          </p>
          <p className="t-statement relative">
            <span className="relative inline-block">
              <span className="absolute -left-[0.2em] bottom-[0.1em]">
                <PixelMark kind="word" />
              </span>
              Forward
            </span>{" "}
            deployed
          </p>
        </Specimen>
        <ul className="flex flex-col gap-2">
          <li className="t-body flex gap-3">
            <PixelMark kind="bullet" />
            <span>Sample point: one finding per line.</span>
          </li>
          <li className="t-body flex gap-3">
            <PixelMark kind="bullet" />
            <span>Sample point: the bullet sits on the first line.</span>
          </li>
        </ul>

        <div className="flex flex-col gap-4">
          <h3 className="t-meta text-ink-2">Tiles: well, tint, paper, stats</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tile as="section" labelledBy="tile-well">
              <h4 id="tile-well" className="t-lift-title">
                Well
              </h4>
              <p className="t-small mt-3 text-ink-2">Sample tile text.</p>
            </Tile>
            <Tile as="section" tone="tint" labelledBy="tile-tint">
              <h4 id="tile-tint" className="t-lift-title">
                Tint
              </h4>
              <p className="t-small mt-3 text-ink-2">Sample tile text.</p>
            </Tile>
            <Tile as="section" tone="paper" labelledBy="tile-paper">
              <h4 id="tile-paper" className="t-lift-title">
                Paper
              </h4>
              <p className="t-small mt-3 text-ink-2">Sample tile text.</p>
            </Tile>
            <Tile as="section" tone="stats" labelledBy="tile-stats">
              <h4 id="tile-stats" className="t-lift-title">
                Stats
              </h4>
              <p className="t-meta mt-3">Sample label</p>
            </Tile>
          </div>
        </div>

        <Specimen title="Links">
          <TextLink href="/portfolio">All work</TextLink>
          <TextLink href="/portfolio" arrow="left">
            All work
          </TextLink>
          <TextLink href="https://github.com" arrow="up-right" external>
            GitHub
          </TextLink>
          <p className="t-body">
            A prose link to the{" "}
            <TextLink href="/resume" tone="prose">
              full résumé
            </TextLink>
            .
          </p>
        </Specimen>

        <div className="flex flex-col gap-4">
          <h3 className="t-meta text-ink-2">
            Card link: one link, the whole card clickable
          </h3>
          <article
            aria-labelledby="card-demo"
            className="ds-stretch-card relative flex max-w-md flex-col gap-3 rounded-[24px] bg-well p-6"
            style={{ boxShadow: "var(--elev-ring)" }}
          >
            <h4 id="card-demo" className="t-lift-title">
              TBH Intranet
            </h4>
            <p className="t-small text-ink-2">Sample summary of the project.</p>
            <a href="/portfolio/tbh-intranet" className="ds-stretch self-start">
              <span className={pillClass({ size: "sm" })}>
                Read the case study
                <span className="sr-only">: TBH Intranet</span>
                <CtaArrow />
              </span>
            </a>
          </article>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="t-meta text-ink-2">
            Motion toggle: pauses anything that moves for more than 5 s
          </h3>
          <Marquee
            label="Sample wordmarks"
            items={WORDMARKS}
            getKey={(name) => name}
            renderItem={(name) => name}
            itemClassName="text-[1.25rem] font-semibold tracking-tight text-ink-2"
          />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="t-meta text-ink-2">
            Dither field: drawn once per size and theme
          </h3>
          <div
            className="relative h-48 overflow-hidden rounded-[24px] bg-page"
            style={{ boxShadow: "var(--elev-ring)" }}
          >
            <DitherField className="absolute inset-0" />
          </div>
        </div>
      </Section>

      <Section id="states" title="States and preferences">
        <ul className="t-body flex max-w-[64ch] flex-col gap-3 text-ink-80">
          <li>
            Focus: tab through this page; every control shows a 2 px accent
            outline 3 px out, and dark pills add the striped ring.
          </li>
          <li>
            Hover, with a mouse or trackpad only: the striped ring, the swap
            arrows and the ghost lift.
          </li>
          <li>
            Reduced motion: no ping, no marquee, no reveal; the motion toggle
            does not render.
          </li>
          <li>
            Forced colors: pills, chips and tiles keep visible edges; pixel
            marks and dither fields hide.
          </li>
          <li>
            More contrast: small text moves from ink 60 to ink 80 and every ring
            gets stronger.
          </li>
        </ul>
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal>
            <Tile>
              <p className="t-small text-ink-2">
                Reveal: rises on entering view.
              </p>
            </Tile>
          </Reveal>
          <Reveal delay={120}>
            <Tile tone="tint">
              <p className="t-small text-ink-2">Reveal with a 120 ms delay.</p>
            </Tile>
          </Reveal>
          <Reveal variant="scale" delay={240}>
            <Tile tone="paper">
              <p className="t-small text-ink-2">Reveal, scale variant.</p>
            </Tile>
          </Reveal>
        </div>
      </Section>

      {/* Phase 4: the testimonial notebook, with labelled samples (plan step 4f). */}
      <Section id="notebook" title="Notebook, with sample notes">
        <p className="t-body max-w-[64ch] text-ink-80">
          These three notes are samples, for reviewing the notebook. The Home
          shows it only once three or more real recommendations are cleared.
        </p>
        <Notebook entries={SAMPLE_NOTES} />
      </Section>
    </div>
  );
}
