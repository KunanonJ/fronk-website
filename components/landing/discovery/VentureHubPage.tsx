import Link from "@/components/navigation/Link";
import { Bento, PageMain } from "@/components/bento/Bento";
import { ctaClasses } from "@/components/bento/Buttons";
import { EyebrowChip, LivePill } from "@/components/bento/Chips";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import type { ShareTarget } from "@/components/bento/ShareRows";
import type { HubLink } from "@/components/landing/discovery/LinkRows";
import {
  AlsoBuildingCard,
  CategoryChips,
  LoopStepper,
  RelatedTopicsCard,
  RoleFooter,
  SectionCard,
  VentureShareCard,
  VentureStats,
} from "@/components/landing/discovery/VentureCards";
import { getAllVentures, type Venture } from "@/lib/content/ventures";
import { TITLE_SUFFIX, namedPageTitle } from "@/lib/seo/pageTitle";
import { siteConfig } from "@/lib/site";
import { PageTitle, HeroLead } from "@/components/bento/PageHero";

type VentureHubPageProps = {
  venture: Venture;
  relatedTopics?: readonly HubLink[];
};

/** What Share shares: the page's head() title and canonical URL. */
function shareTarget(venture: Venture): ShareTarget {
  return {
    title: `${namedPageTitle(venture.name, venture.tagline)}${TITLE_SUFFIX}`,
    url: new URL(`/ventures/${venture.slug}`, siteConfig.url).href,
  };
}

/**
 * The hero: eyebrow, the h1 (logo and name, then the tagline with its last
 * line in the accent colour) beside the Live pill, the intro and the actions.
 * The h1 is the LCP element; its lines only slide (`kj-lines`).
 */
function VentureHero({ venture }: { venture: Venture }) {
  const caseStudy = venture.caseStudy;
  const lines = caseStudy?.taglineLines ?? [venture.tagline];
  const muted = lines.slice(0, -1);
  const accent = lines[lines.length - 1];

  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-6">
      <EyebrowChip>Venture</EyebrowChip>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-5">
        <PageTitle>
          <span className="block">
            <img
              src={venture.logo}
              alt=""
              width={62}
              height={62}
              decoding="async"
              className="mr-[0.14em] inline-block size-[1.1em] rounded-[0.28em] border-[3px] border-surface bg-paper object-cover align-[-0.2em] shadow-card"
            />
            {venture.name}
          </span>{" "}
          {muted.map((line) => (
            <span key={line} className="block text-ink-3">
              {line}{" "}
            </span>
          ))}
          <span className="block text-mark">{accent}</span>
        </PageTitle>
        {venture.status === "active" && caseStudy ? (
          <LivePill status={caseStudy.timeline} className="mb-2" />
        ) : null}
      </div>
      <HeroLead>{caseStudy?.intro ?? venture.description}</HeroLead>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={venture.url}
          target="_blank"
          rel="noopener noreferrer"
          className={ctaClasses()}
        >
          Visit {venture.urlLabel}
          <ArrowUpRightIcon strokeWidth={2} />
        </a>
        <Link href="/contact" className={ctaClasses("secondary")}>
          Contact
        </Link>
        <SharePill />
        {venture.offer ? (
          <p className="m-0 text-sm font-medium text-ink-2">
            {venture.offer.label}
          </p>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Venture case hub (bento redesign, phase 7c; design spec 4.7). A dense
 * bento: the stat tiles, the case sections as cards (the first with the
 * category chips, the second with the core-loop stepper, "My role" with the
 * founder), related topics, the other venture and Share. Blocks with no data
 * are left out: Manut has no metrics and no loop.
 */
export default function VentureHubPage({
  venture,
  relatedTopics = [],
}: VentureHubPageProps) {
  const sections = venture.caseStudy?.sections ?? [];
  const [what, stands, role, ...more] = sections;
  const loop = venture.caseStudy?.loop ?? [];
  const other = getAllVentures().find(
    (candidate) => candidate.slug !== venture.slug && candidate.caseStudy,
  );

  return (
    <PageMain>
      <VentureHero venture={venture} />
      <Bento dense>
        {venture.metrics && venture.metrics.length > 0 ? (
          <VentureStats metrics={venture.metrics} />
        ) : null}
        {what ? (
          <SectionCard id="card-s1" section={what}>
            {venture.stack.length > 0 ? (
              <CategoryChips items={venture.stack} />
            ) : null}
          </SectionCard>
        ) : null}
        {stands ? (
          <SectionCard id="card-s2" section={stands} span={2}>
            {loop.length > 1 ? <LoopStepper stages={loop} /> : null}
          </SectionCard>
        ) : null}
        {role ? (
          <SectionCard id="card-s3" section={role}>
            <RoleFooter />
          </SectionCard>
        ) : null}
        {more.map((section, i) => (
          <SectionCard
            key={section.heading}
            id={`card-s${i + 4}`}
            section={section}
          />
        ))}
        {relatedTopics.length > 0 ? (
          <RelatedTopicsCard links={relatedTopics} />
        ) : null}
        {other ? <AlsoBuildingCard venture={other} /> : null}
        <VentureShareCard target={shareTarget(venture)} />
      </Bento>
    </PageMain>
  );
}
