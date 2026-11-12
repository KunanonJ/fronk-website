import { ArrowRight } from "lucide-react";
import Link from "@/components/navigation/Link";
import { BentoCard } from "@/components/bento/Bento";
import { ctaClasses } from "@/components/bento/Buttons";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import CopyButton from "@/components/landing/skills/CopyButton";
import InstallTabs from "@/components/landing/skills/InstallTabs";
import SkillsCatalog from "@/components/landing/skills/SkillsCatalog";
import {
  CODE,
  CommandRow,
  DownloadCta,
  EXTERNAL,
  INLINE_LINK,
  NOTE,
} from "@/components/landing/skills/SkillParts";
import {
  ADAPTED_COUNT,
  ORIGINAL_COUNT,
  PACK_INSTALL,
  PLUGIN_FOLDER_URL,
  PLUGIN_ZIP,
  SKILL_PIPELINE,
  SKILL_SOURCES,
  SKILLS_RELEASE_MONTH,
  SKILLS_RELEASE_URL,
  SKILLS_REPO,
  SKILLS_REPO_URL,
  SKILLS_TAG,
  SOURCES_LOCK_URL,
  THIRD_PARTY_URL,
  getAllSkills,
  getSkillBySlug,
  skillsPage,
  sourceLabel,
} from "@/lib/content/skills";
import type { SkillFilter } from "@/lib/skills/search";
import { cn } from "@/lib/utils/cn";
import { pad2 } from "@/lib/utils/pad2";
import { PageTitle, HeroLead } from "@/components/bento/PageHero";

const TOTAL = ORIGINAL_COUNT + ADAPTED_COUNT;

/*
 * /skills (bento redesign, phase 7d; design spec 4.8): the hero, the install
 * row (whole pack, ask your agent, the pipeline), the filterable catalog and
 * the credits. Copy and commands come from lib/content/skills and its
 * snapshot; nothing here is written by hand.
 */

function SkillsHero() {
  const { headline } = skillsPage;
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
        <div className="flex flex-col items-start gap-5">
          <p className="m-0 rounded-full border border-hairline bg-surface px-3 py-[7px] text-meta leading-none font-medium">
            {skillsPage.eyebrow}
          </p>
          <PageTitle>
            <span className="block">
              <span className="text-ink-3">{headline.muted}</span>{" "}
              {headline.rest}
            </span>{" "}
            <span className="block text-mark">{headline.accent}</span>
          </PageTitle>
        </div>
        <a
          href={SKILLS_RELEASE_URL}
          aria-label={`Superstacks ${SKILLS_TAG} · ${SKILLS_RELEASE_MONTH}, release on GitHub`}
          {...EXTERNAL}
          className="mb-1.5 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-hairline-strong bg-surface px-4 text-card font-medium text-ink no-underline"
        >
          <span aria-hidden className="size-2 shrink-0 bg-mark" />
          <span>
            Superstacks <span className="font-mono">{SKILLS_TAG}</span>
          </span>
          <span className="text-ink-2">· {SKILLS_RELEASE_MONTH}</span>
          <ArrowUpRightIcon size={14} />
        </a>
      </div>
      <HeroLead>{skillsPage.description}</HeroLead>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-4">
        <div className="flex flex-wrap gap-3">
          <a
            href={SKILLS_REPO_URL}
            aria-label={`View on GitHub: ${SKILLS_REPO}`}
            {...EXTERNAL}
            className={ctaClasses()}
          >
            View on GitHub
            <ArrowUpRightIcon />
          </a>
          <SharePill />
        </div>
        <p className="m-0 text-card text-ink-2">
          <span className="font-mono">{TOTAL}</span> skills · MIT license ·{" "}
          <span className="font-mono">{ORIGINAL_COUNT}</span> original,{" "}
          <span className="font-mono">{ADAPTED_COUNT}</span> adapted ·
          maintained by{" "}
          <Link
            href={skillsPage.maintainer.href}
            rel="author"
            className="font-medium text-ink underline underline-offset-4"
          >
            {skillsPage.maintainer.name}
          </Link>
        </p>
      </div>
    </section>
  );
}

const packTabs = [
  {
    id: "claude-code",
    label: "Claude Code",
    panel: (
      <div className="flex flex-col gap-4">
        <CommandRow
          label="1. Add the marketplace (type it in Claude Code)"
          command={PACK_INSTALL.claudeCode[0]}
          accessibleLabel="Copy the Claude Code marketplace command"
          announcement="Copied the marketplace command"
        />
        <CommandRow
          label="2. Install the plugin"
          command={PACK_INSTALL.claudeCode[1]}
          accessibleLabel="Copy the Claude Code plugin install command"
          announcement="Copied the plugin install command"
        />
        <p className={NOTE}>
          Installs all {TOTAL} skills as one plugin, named{" "}
          <code className={CODE}>superstacks</code>.
        </p>
      </div>
    ),
  },
  {
    id: "codex",
    label: "Codex",
    panel: (
      <CommandRow
        label="Run in your terminal"
        command={PACK_INSTALL.codex}
        accessibleLabel="Copy the Codex marketplace command"
        announcement="Copied the Codex command"
      />
    ),
  },
  {
    id: "cursor",
    label: "Cursor",
    panel: (
      <div className="flex flex-col gap-4">
        <p className={cn(NOTE, "leading-[1.55]")}>
          Until the public Cursor listing exists, copy the{" "}
          <a
            href={PLUGIN_FOLDER_URL}
            {...EXTERNAL}
            className="font-mono text-meta"
          >
            {PACK_INSTALL.cursorFrom}
          </a>{" "}
          folder from the repo into this folder:
        </p>
        <CommandRow
          command={PACK_INSTALL.cursorTo}
          accessibleLabel="Copy the Cursor local plugins path"
          announcement="Copied the Cursor plugins path"
        />
      </div>
    ),
  },
  {
    id: "npx",
    label: "npx skills",
    panel: (
      <div className="flex flex-col gap-4">
        <CommandRow
          label="Installs every skill globally for the agents it finds"
          command={PACK_INSTALL.npx}
          accessibleLabel="Copy the npx skills command for the whole pack"
          announcement="Copied the npx skills command"
        />
        <p className={NOTE}>
          <code className={CODE}>npx skills</code> is a third-party installer;{" "}
          <code className={CODE}>DISABLE_TELEMETRY=1</code> turns its telemetry
          off.
        </p>
      </div>
    ),
  },
  {
    id: "zip",
    label: "ZIP",
    panel: (
      <div className="flex flex-col items-start gap-[18px]">
        <p className={cn(NOTE, "max-w-[520px] leading-[1.55]")}>
          claude.ai and ChatGPT take one skill per ZIP: use the ZIP link on any
          skill below. For the OpenAI plugin portal, upload the whole pack as
          one file.
        </p>
        <DownloadCta asset={PLUGIN_ZIP} label="Download plugin ZIP" />
      </div>
    ),
  },
];

/** The README's pipeline as numbered rows; the last ends on the accent square. */
function PipelineCard() {
  const steps = SKILL_PIPELINE.flatMap((step) => {
    const skill = getSkillBySlug(step.slug);
    return skill ? [{ ...step, name: skill.name }] : [];
  });
  return (
    <BentoCard
      id="pipeline"
      headingId="card-pipeline"
      title="The pipeline"
      gap={3.5}
      minHeight={false}
      className="min-w-0 flex-[1_1_100%] scroll-mt-6"
    >
      <p className="m-0 max-w-[640px] text-card leading-[1.55] text-ink-2">
        The order the skills run in on a ticket, from the Superstacks README.{" "}
        <Link href="/skills/ticket-pipeline" className="font-mono text-sm">
          ticket-pipeline
        </Link>{" "}
        routes a ticket through it.
      </p>
      <ol className="m-0 mt-1 flex list-none flex-wrap gap-2 p-0">
        {steps.map((step, index) => (
          <li
            key={step.slug}
            className="flex min-w-[140px] flex-[1_1_calc(25%-6px)]"
          >
            <Link
              href={`/skills/${step.slug}`}
              className="kj-row flex min-h-11 flex-1 flex-col gap-2.5 rounded-2xl px-3 pt-3 pb-3.5 text-ink no-underline"
            >
              <span
                aria-hidden
                className="flex items-center gap-2.5 font-mono text-xs text-ink-2"
              >
                {pad2(index + 1)}
                <span className="h-px flex-1 bg-hairline-strong" />
                {index < steps.length - 1 ? (
                  <ArrowRight size={14} />
                ) : (
                  <span className="size-2 bg-mark" />
                )}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-card leading-[1.4] font-medium [overflow-wrap:anywhere]">
                  {step.name}
                </span>
                {step.note ? (
                  <span className="text-meta leading-[1.4] text-ink-2">
                    ({step.note})
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </BentoCard>
  );
}

function InstallRow() {
  return (
    <div className="flex flex-wrap gap-5">
      <BentoCard
        id="install"
        headingId="card-install"
        title="Install the whole pack"
        className="min-w-0 flex-[2_1_440px] scroll-mt-6"
      >
        <InstallTabs
          label="Install the whole pack with"
          idBase="pack-install"
          tabs={packTabs}
          panelClassName="min-h-[252px]"
        />
      </BentoCard>
      <BentoCard
        headingId="card-ask"
        title="Or ask your agent"
        gap={3.5}
        className="min-w-0 flex-[1_1_280px]"
      >
        <p className={NOTE}>
          Paste this into Claude Code, Codex or Cursor and let it follow the
          README.
        </p>
        <figure className="m-0 flex flex-1 flex-col justify-between gap-[18px] rounded-well bg-surface-tint p-[18px]">
          <p className="m-0 text-lg leading-[1.45] font-medium tracking-[-0.01em] [overflow-wrap:anywhere] text-ink">
            {skillsPage.askAgentPrompt}
          </p>
          <figcaption className="flex justify-end">
            <CopyButton
              text={skillsPage.askAgentPrompt}
              label="Copy prompt"
              size="prompt"
              accessibleLabel="Copy prompt for your agent"
              announcement="Copied the prompt"
            />
          </figcaption>
        </figure>
      </BentoCard>
      <PipelineCard />
    </div>
  );
}

const shortSha = (sha: string) => sha.slice(0, 7);

/** Upstream projects: license, pinned commit, and the skills taken from each. */
function CreditsCard() {
  return (
    <BentoCard headingId="card-credits" title="Credits" minHeight={false}>
      <p className="m-0 max-w-[640px] text-card leading-[1.55] text-ink-2">
        {ADAPTED_COUNT} skills are adapted from these MIT-licensed projects,
        pinned to a commit and patched where noted. Full notices are in{" "}
        <a href={THIRD_PARTY_URL} {...EXTERNAL} className={INLINE_LINK}>
          THIRD_PARTY.md
        </a>{" "}
        and pins in{" "}
        <a href={SOURCES_LOCK_URL} {...EXTERNAL} className={INLINE_LINK}>
          sources.lock.json
        </a>
        .
      </p>
      <ul className="bento-2 m-0 grid list-none grid-cols-1 gap-3 p-0 min-[641px]:grid-cols-2">
        {SKILL_SOURCES.map((source) => {
          const label = sourceLabel(source);
          return (
            <li
              key={source.name}
              className="flex flex-col gap-1 rounded-well border border-hairline bg-page px-4 pt-2.5 pb-3.5"
            >
              <h3 className="m-0 font-mono text-card font-medium">
                <a
                  href={source.url}
                  {...EXTERNAL}
                  className="inline-flex min-h-11 items-center no-underline"
                >
                  {label}
                </a>
              </h3>
              <p className="m-0 text-meta leading-[1.5] text-ink-2">
                {source.license} · {source.copyright}
              </p>
              {source.sha ? (
                <p className="m-0 flex items-center gap-1.5 text-meta text-ink-2">
                  Pinned at{" "}
                  <a
                    href={`${source.url}/tree/${source.sha}`}
                    {...EXTERNAL}
                    className="inline-flex min-h-11 items-center font-mono"
                  >
                    {shortSha(source.sha)}
                  </a>
                </p>
              ) : null}
              {source.skills.length > 0 ? (
                <ul
                  aria-label={`Skills adapted from ${label}`}
                  className="m-0 flex list-none flex-wrap gap-x-4 border-t border-hairline p-0 pt-1.5 font-mono text-meta"
                >
                  {source.skills.map((slug) => (
                    <li key={slug}>
                      {/* Short slugs such as "pr" get a 24 px tap area from
                          padding the negative margin takes back; with the
                          16 px gap, neighbouring areas stay 4 px apart. */}
                      <Link
                        href={`/skills/${slug}`}
                        className="-mx-1.5 inline-flex min-h-11 min-w-6 items-center justify-center px-1.5"
                      >
                        {slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="m-0 mt-1.5 border-t border-hairline pt-2.5 text-meta leading-[1.6] text-ink-2">
                  Credited excerpt inside{" "}
                  {getAllSkills()
                    .filter((s) =>
                      s.excerpts.some((e) => e.name === source.name),
                    )
                    .map((s) => (
                      <Link
                        key={s.slug}
                        href={`/skills/${s.slug}`}
                        className="font-mono"
                      >
                        {s.name}
                      </Link>
                    ))}
                  .{source.note ? ` ${source.note}` : null}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </BentoCard>
  );
}

export default function SkillsIndexPage({
  show,
  onShowChange,
}: {
  show: SkillFilter;
  onShowChange: (next: SkillFilter) => void;
}) {
  return (
    <>
      <SkillsHero />
      <InstallRow />
      <SkillsCatalog show={show} onShowChange={onShowChange} />
      <CreditsCard />
    </>
  );
}
