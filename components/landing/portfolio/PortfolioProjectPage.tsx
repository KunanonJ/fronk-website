import type { ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { Bento, BentoCard, CardTitle } from "@/components/bento/Bento";
import { CtaLink, ctaClasses } from "@/components/bento/Buttons";
import { EyebrowChip } from "@/components/bento/Chips";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  HeroTitle,
  LockIcon,
  PersonIcon,
  accessDetail,
} from "@/components/landing/portfolio/PortfolioParts";
import {
  ArchitectureCard,
  BuiltColumn,
  FlowCard,
  HighlightsCard,
  InterfaceCard,
  MyPartCard,
  OutcomeCard,
  ProblemCard,
  ProjectPager,
} from "@/components/landing/portfolio/ProjectCards";
import { taglineLines } from "@/components/landing/portfolio/portfolioLayout";
import {
  HIRING_CONTACT_HREF,
  OPEN_TO_ROLES,
  RESUME_HREF,
} from "@/lib/content/availability";
import { portfolioPage, type PortfolioProject } from "@/lib/content/portfolio";
import { HeroLead } from "@/components/bento/PageHero";

/*
 * /portfolio/$slug (bento redesign, phase 7e; design spec 4.6). The canvas
 * draws TBH Intranet; the other projects use the same template with their
 * own data: the h1 sets the name over the tagline split in two, each draws
 * its own mockup kind, workflow and layers, and blocks with no data are
 * left out (only TBH Intranet has a Before / After).
 */

function ProjectHero({ project }: { project: PortfolioProject }) {
  const { author } = portfolioPage;
  return (
    <section
      aria-labelledby="hero-title"
      className="flex flex-col items-start gap-6"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <EyebrowChip>
          {portfolioPage.eyebrow} · {project.category}
        </EyebrowChip>
        <Link
          href="/portfolio"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium no-underline"
        >
          <ArrowLeftIcon />
          All projects
        </Link>
      </div>
      <HeroTitle
        lines={[
          [{ text: `${project.name}.` }],
          ...taglineLines(project.tagline),
        ]}
      />
      <HeroLead>{project.summary}</HeroLead>
      {/* The byline names him on every project page (SEO): his role there,
          from the project data, and a link to About. */}
      <p className="m-0 text-card text-ink-2">
        By{" "}
        <Link href={author.href} rel="author" className="font-medium">
          {author.name}
        </Link>{" "}
        · {project.role}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {project.access === "public" && project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClasses()}
          >
            {project.urlLabel ?? "Visit"}
            <ArrowUpRightIcon strokeWidth={2} />
          </a>
        ) : null}
        <SharePill />
      </div>
    </section>
  );
}

/** Role, organisation, period and access as four tiles. */
function MetaStrip({ project }: { project: PortfolioProject }) {
  const rows: { label: string; icon: ReactNode; value: string }[] = [
    { label: "Role", icon: <PersonIcon />, value: project.role },
    {
      label: "Organisation",
      icon: <BuildingIcon />,
      value: project.organization,
    },
    { label: "Period", icon: <CalendarIcon />, value: project.period },
    {
      label: "Access",
      icon: <LockIcon />,
      value: accessDetail(project.access),
    },
  ];
  return (
    <dl className="m-0 flex flex-wrap gap-4">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex min-w-0 flex-[1_1_150px] flex-col gap-2.5 rounded-bento border border-hairline bg-surface px-5 pt-[18px] pb-5 shadow-card"
        >
          <dt className="flex items-center gap-2 font-mono text-label text-ink-2 uppercase">
            {row.icon}
            {row.label}
          </dt>
          <dd className="m-0 text-base leading-[1.4] font-medium">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The card that closes the case study (recruiter-fit phase 2): the page used
 * to end on previous and next links, with nowhere to go for someone hiring.
 */
function HireCard() {
  const { hire } = portfolioPage;
  return (
    <BentoCard headingId="card-hire" title={hire.kicker} minHeight={false}>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 px-1">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
          <CardTitle>{hire.heading}</CardTitle>
          <p className="m-0 max-w-[560px] text-card leading-[1.55] text-ink-2">
            {OPEN_TO_ROLES.sentence}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CtaLink href={RESUME_HREF} size="md">
            {hire.resumeLabel}
          </CtaLink>
          <CtaLink href={HIRING_CONTACT_HREF} variant="secondary" size="md">
            {hire.contactLabel}
          </CtaLink>
        </div>
      </div>
    </BentoCard>
  );
}

export default function PortfolioProjectPage({
  project,
}: {
  project: PortfolioProject;
}) {
  const [problem, ...more] = project.sections;
  const outcomes = project.outcomes ?? [];
  return (
    <>
      <ProjectHero project={project} />
      <div className="flex flex-col gap-5">
        <MetaStrip project={project} />
        <Bento dense>
          {/* What changed and his part come first: a recruiter reads these
              before the mockup. Each takes a full row. Side by side, the
              longer text stretched the figures' card and left it half empty. */}
          {outcomes.length > 0 ? <OutcomeCard outcomes={outcomes} /> : null}
          {project.myPart ? <MyPartCard text={project.myPart} /> : null}
          <InterfaceCard project={project} />
          {problem ? (
            <ProblemCard section={problem} beforeAfter={project.beforeAfter} />
          ) : null}
          <HighlightsCard items={project.highlights} />
          {project.workflow ? <FlowCard workflow={project.workflow} /> : null}
          {project.architecture ? (
            <ArchitectureCard architecture={project.architecture} />
          ) : null}
          <BuiltColumn sections={more} stack={project.stack} />
        </Bento>
        <HireCard />
      </div>
      <ProjectPager slug={project.slug} />
    </>
  );
}
