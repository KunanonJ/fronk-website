import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, FileText } from "lucide-react";
import Link from "@/components/navigation/Link";
import { Bento, BentoCard, CardLink } from "@/components/bento/Bento";
import { ctaClasses } from "@/components/bento/Buttons";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import InstallTabs from "@/components/landing/skills/InstallTabs";
import SkillSourceCard from "@/components/landing/skills/SkillSourceCard";
import {
  CODE,
  CommandRow,
  DownloadCta,
  EXTERNAL,
  INLINE_LINK,
  NOTE,
  SkillTags,
} from "@/components/landing/skills/SkillParts";
import {
  PACK_INSTALL,
  SKILLS_RELEASE_DATE,
  SKILLS_RELEASE_URL,
  SKILLS_TAG,
  SOURCES_LOCK_URL,
  copyrightHolder,
  formatBytes,
  getAdjacentSkills,
  getAllSkills,
  getSkillStage,
  getStageSiblings,
  skillInstallCommands,
  skillsPage,
  sourceLabel,
  type Skill,
  type SkillAsset,
  type SkillStage,
} from "@/lib/content/skills";
import { cn } from "@/lib/utils/cn";
import { HeroLead } from "@/components/bento/PageHero";

/*
 * /skills/$slug (bento redesign, phase 7d; design spec 4.9). The canvas
 * draws verify-loop, an original skill that runs automatically and ships
 * scripts; every other skill uses the same template with its own data:
 * adapted skills get an Origin card with the upstream, pinned commit and
 * patches, user-invoked skills say so in How it runs, and the Files card
 * lists whatever the folder holds. The canvas's hand-picked loop steps for
 * verify-loop have no source for the other skills, so no skill shows them.
 */

/** SKILL.md first, then the rest in path order. */
function orderedFiles(skill: Skill) {
  return [...skill.files].sort((a, b) =>
    a.path === "SKILL.md"
      ? -1
      : b.path === "SKILL.md"
        ? 1
        : a.path.localeCompare(b.path),
  );
}

function SkillHero({ skill, stage }: { skill: Skill; stage: SkillStage }) {
  return (
    <section aria-labelledby="hero-title" className="flex flex-col gap-[26px]">
      <nav aria-label="Breadcrumb">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 text-sm text-ink-2">
          <li>
            <Link
              href="/skills"
              className="inline-flex min-h-11 items-center font-medium no-underline"
            >
              Skills
            </Link>
          </li>
          <li aria-hidden className="flex items-center">
            <ChevronRight size={14} />
          </li>
          <li>
            <span aria-current="page" className="font-mono text-ink">
              {skill.name}
            </span>
          </li>
        </ol>
      </nav>
      <div className="-mt-2.5 flex flex-col items-start gap-5">
        <p className="m-0 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-[7px] text-meta leading-none font-medium">
          Skill <span className="text-ink-2">·</span> {stage.label}
        </p>
        <h1
          id="hero-title"
          className="kj-lines m-0 max-w-[820px] text-title text-ink"
        >
          <span className="block font-mono font-medium tracking-[-0.03em] [overflow-wrap:anywhere]">
            {skill.name}
          </span>
        </h1>
      </div>
      <HeroLead>{skill.description}</HeroLead>
      <p className="m-0 text-card text-ink-2">
        {skill.source ? "Adapted and maintained by" : "Written by"}{" "}
        <Link
          href={skillsPage.maintainer.href}
          rel="author"
          className="font-medium text-ink underline underline-offset-4"
        >
          {skillsPage.maintainer.name}
        </Link>
      </p>
      <ul
        aria-label="About this skill"
        className="m-0 flex list-none flex-wrap items-center gap-2 p-0"
      >
        <SkillTags skill={skill} variant="hero" />
        <li className="inline-flex min-h-[34px] items-center rounded-full border border-hairline-strong bg-surface px-3 font-mono text-xs text-ink-2">
          {skill.license}
        </li>
        <li>
          <a
            href={SKILLS_RELEASE_URL}
            aria-label={`Superstacks ${SKILLS_TAG}, release on GitHub`}
            {...EXTERNAL}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline-strong bg-surface px-3.5 text-meta font-medium text-ink no-underline"
          >
            Superstacks <span className="font-mono text-xs">{SKILLS_TAG}</span>
            <ArrowUpRightIcon size={12} />
          </a>
        </li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <a
          href={skill.folderUrl}
          aria-label={`View on GitHub: ${skill.name}`}
          {...EXTERNAL}
          className={ctaClasses()}
        >
          View on GitHub
          <ArrowUpRightIcon />
        </a>
        <SharePill />
      </div>
    </section>
  );
}

function ZipPanel({ note, asset }: { note: ReactNode; asset: SkillAsset }) {
  return (
    <div className="flex flex-col items-start gap-[18px]">
      <p className={cn(NOTE, "max-w-[520px] leading-[1.55]")}>{note}</p>
      <DownloadCta asset={asset} label={`Download ${asset.name}`} />
    </div>
  );
}

function InstallCard({ skill }: { skill: Skill }) {
  const { npx, copyPath } = skillInstallCommands(skill);
  const tabs = [
    {
      id: "npx",
      label: "npx skills",
      panel: (
        <div className="flex flex-col gap-4">
          <CommandRow
            label={
              <>
                Installs only{" "}
                <code className="font-mono text-ink">{skill.name}</code>,
                globally, as a copy
              </>
            }
            command={npx}
            accessibleLabel={`Copy install command for ${skill.name}`}
            announcement={`Copied the install command for ${skill.name}`}
          />
          <p className={NOTE}>
            Third-party installer;{" "}
            <code className={CODE}>DISABLE_TELEMETRY=1</code> turns its
            telemetry off.
          </p>
        </div>
      ),
    },
    {
      id: "zip",
      label: "ZIP for Claude Code / Codex",
      panel: (
        <ZipPanel
          asset={skill.zip}
          note={
            <>
              Folder layout (<code className={CODE}>{skill.name}/SKILL.md</code>
              ). Unzip it into your agent’s skills directory.
            </>
          }
        />
      ),
    },
    {
      id: "flat",
      label: "ZIP for claude.ai / ChatGPT",
      panel: (
        <ZipPanel
          asset={skill.flatZip}
          note={
            <>
              Flat layout: <code className={CODE}>SKILL.md</code> sits at the
              zip root, ready to upload as a skill.
            </>
          }
        />
      ),
    },
    {
      id: "copy",
      label: "Plain copy",
      panel: (
        <CommandRow
          label={
            <>
              Copy this folder from the{" "}
              <a href={skill.folderUrl} {...EXTERNAL} className={INLINE_LINK}>
                repo at {SKILLS_TAG}
              </a>{" "}
              into your agent’s skills directory
            </>
          }
          command={copyPath}
          accessibleLabel={`Copy the repo path of ${skill.name}`}
          announcement={`Copied the ${skill.name} folder path`}
        />
      ),
    },
    {
      id: "pack",
      label: "Full pack",
      panel: (
        <div className="flex flex-col gap-3.5">
          <p className={NOTE}>
            <code className={CODE}>{skill.name}</code> ships in the Superstacks
            plugin with the other skills. In Claude Code:
          </p>
          <CommandRow
            command={PACK_INSTALL.claudeCode.join("\n")}
            accessibleLabel="Copy the Claude Code plugin commands"
            announcement="Copied both plugin commands"
          />
          <p className={NOTE}>
            Run them one at a time. Codex, Cursor and ZIP steps are on{" "}
            <Link href="/skills#install" className={INLINE_LINK}>
              the Skills page
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];

  return (
    <BentoCard
      id="install"
      headingId="card-install"
      title="Install this skill"
      span={2}
      className="scroll-mt-6"
    >
      <InstallTabs
        label={`Install ${skill.name} with`}
        idBase="skill-install"
        tabs={tabs}
        panelClassName="min-h-[196px]"
      />
    </BentoCard>
  );
}

/** Who loads the skill. No step list: only verify-loop's was hand-picked. */
function RunsCard({ skill }: { skill: Skill }) {
  return (
    <BentoCard headingId="card-runs" title="How it runs" gap={3.5}>
      <p className="m-0 mt-1 text-[22px] leading-[1.25] font-semibold tracking-[-0.02em]">
        {skill.userInvoked ? "You invoke it." : "Runs automatically."}
      </p>
      <p className="m-0 text-card leading-[1.55] text-ink-2">
        {skill.userInvoked ? (
          <>
            Its frontmatter sets{" "}
            <code className={CODE}>disable-model-invocation: true</code>, so the
            agent never loads it on its own. Ask for it by name.
          </>
        ) : (
          "The agent loads it when a task matches the description above. You can also ask for it by name."
        )}
      </p>
    </BentoCard>
  );
}

function FilesCard({ skill }: { skill: Skill }) {
  return (
    <BentoCard headingId="card-files" title="Files" gap={3}>
      <ul className="m-0 mt-1 flex list-none flex-col p-0">
        {orderedFiles(skill).map((file) => (
          <li
            key={file.path}
            className="border-b border-hairline last:border-b-0"
          >
            <a
              href={file.url}
              {...EXTERNAL}
              className="kj-row -mx-2 flex min-h-12 items-center justify-between gap-3 rounded-tile px-2 py-1 text-ink no-underline"
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <FileText
                  aria-hidden
                  size={15}
                  strokeWidth={1.8}
                  className="shrink-0 text-ink-2"
                />
                <span className="font-mono text-meta [overflow-wrap:anywhere]">
                  {file.path.split("/").map((part, i, parts) => (
                    <span key={`${i}-${part}`}>
                      {part}
                      {i < parts.length - 1 ? (
                        <>
                          /<wbr />
                        </>
                      ) : null}
                    </span>
                  ))}
                </span>
              </span>
              {/* Read as "SKILL.md, 2.1 KB, opens on GitHub". */}
              <span className="sr-only">
                , {formatBytes(file.size)}, opens on GitHub
              </span>
              <span
                aria-hidden
                className="shrink-0 font-mono text-xs text-ink-2 tabular-nums"
              >
                {formatBytes(file.size)}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a
        href={skill.folderUrl}
        {...EXTERNAL}
        className="mt-auto inline-flex min-h-11 items-center self-end text-sm font-medium no-underline"
      >
        Folder on GitHub →
      </a>
    </BentoCard>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-hairline py-2.5">
      <dt className="text-ink-2">{term}</dt>
      <dd className="m-0 text-right font-mono text-meta">{children}</dd>
    </div>
  );
}

/**
 * Where the skill comes from: written for Superstacks, or adapted from an
 * upstream at a pinned commit, with the Superstacks patches on top.
 */
function OriginCard({ skill }: { skill: Skill }) {
  const { source } = skill;
  return (
    <BentoCard headingId="card-origin" title="Origin" gap={3}>
      <div className="mt-1.5 flex flex-col gap-1">
        <p className="m-0 text-[40px] leading-[1.1] font-semibold tracking-[-0.03em]">
          {source ? "Adapted" : "Original"}
        </p>
        <p className="m-0 font-mono text-label text-ink-2 uppercase">
          {source ? `From ${sourceLabel(source)}` : "Written for Superstacks"}
        </p>
      </div>
      {source ? (
        <p className="m-0 text-sm leading-[1.55] text-ink-2">
          Adapted from{" "}
          <a href={source.url} {...EXTERNAL} className={INLINE_LINK}>
            {sourceLabel(source)}
          </a>{" "}
          by {copyrightHolder(source.copyright)}.
          {skill.patches.length > 0 ? (
            <>
              {" "}
              Patched in Superstacks:{" "}
              {skill.patches.map((patch, index) => (
                <span key={patch.name}>
                  {index > 0 ? ", " : null}
                  <a
                    href={patch.url}
                    {...EXTERNAL}
                    className="font-mono text-meta"
                  >
                    {patch.name}
                  </a>
                </span>
              ))}
              .
            </>
          ) : null}
        </p>
      ) : (
        <p className="m-0 text-sm leading-[1.55] text-ink-2">
          Written for Superstacks;{" "}
          <a
            href={SOURCES_LOCK_URL}
            {...EXTERNAL}
            className="font-mono text-meta"
          >
            sources.lock.json
          </a>{" "}
          credits no upstream. Released under {skill.license} with the rest of
          the pack.
        </p>
      )}
      {skill.excerpts.map((excerpt) => (
        <p key={excerpt.name} className="m-0 text-sm leading-[1.55] text-ink-2">
          Includes a credited excerpt from{" "}
          <a href={excerpt.url} {...EXTERNAL} className={INLINE_LINK}>
            {sourceLabel(excerpt)}
          </a>
          : {excerpt.license}, {excerpt.copyright}.
        </p>
      ))}
      <dl className="m-0 mt-auto flex flex-col text-sm">
        <Fact term="License">{source ? source.license : skill.license}</Fact>
        {source ? (
          <Fact term="Copyright">
            {source.copyright.replace(/^Copyright\s*/, "")}
          </Fact>
        ) : null}
        {source?.sha ? (
          <Fact term="Pinned at">
            <a
              href={skill.upstreamUrl ?? `${source.url}/tree/${source.sha}`}
              {...EXTERNAL}
              className="inline-flex min-h-6 items-center"
            >
              {source.sha.slice(0, 7)}
              <span className="sr-only"> (upstream SKILL.md)</span>
            </a>
          </Fact>
        ) : null}
        <Fact term="Release">
          {SKILLS_TAG} · {SKILLS_RELEASE_DATE}
        </Fact>
      </dl>
    </BentoCard>
  );
}

function MoreCard({ skill, stage }: { skill: Skill; stage: SkillStage }) {
  const siblings = getStageSiblings(skill);
  return (
    <BentoCard headingId="card-more" title={`More in ${stage.label}`} gap={3}>
      <p className="m-0 mt-1.5 text-lg leading-[1.4] font-medium tracking-[-0.01em]">
        {stage.blurb}
      </p>
      {siblings.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {siblings.map((s) => (
            <li key={s.slug} className="max-w-full">
              <Link
                href={`/skills/${s.slug}`}
                className="inline-flex min-h-11 max-w-full items-center rounded-full border border-hairline-strong bg-page px-3.5 font-mono text-meta [overflow-wrap:anywhere] text-ink no-underline"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <CardLink href="/skills#catalog" className="mt-auto self-end">
        All {getAllSkills().length} skills →
      </CardLink>
    </BentoCard>
  );
}

const NAV_CARD =
  "flex min-h-[112px] flex-col gap-2 rounded-bento border border-hairline bg-surface px-[22px] py-5 text-ink no-underline shadow-card";

const NAV_LABEL =
  "inline-flex items-center gap-1.5 font-mono text-label text-ink-2 uppercase";

const NAV_NAME =
  "font-mono text-xl font-medium tracking-[-0.02em] [overflow-wrap:anywhere]";

/** Previous and next in catalog order, wrapping around. */
function SkillPager({ skill }: { skill: Skill }) {
  const { prev, next } = getAdjacentSkills(skill.slug);
  if (!prev || !next) return null;
  return (
    <nav
      aria-label="More skills"
      className="bento-2 grid grid-cols-1 gap-5 min-[641px]:grid-cols-2"
    >
      <Link href={`/skills/${prev.slug}`} className={NAV_CARD}>
        <span className={NAV_LABEL}>
          <ArrowLeft aria-hidden size={12} />
          Previous · {getSkillStage(prev.stage).label}
        </span>
        <span className={NAV_NAME}>{prev.name}</span>
      </Link>
      <Link
        href={`/skills/${next.slug}`}
        className={cn(NAV_CARD, "items-end text-right")}
      >
        <span className={NAV_LABEL}>
          Next · {getSkillStage(next.stage).label}
          <ArrowRight aria-hidden size={12} />
        </span>
        <span className={NAV_NAME}>{next.name}</span>
      </Link>
    </nav>
  );
}

export default function SkillDetailPage({ skill }: { skill: Skill }) {
  const stage = getSkillStage(skill.stage);
  return (
    <>
      <SkillHero skill={skill} stage={stage} />
      <Bento>
        <InstallCard skill={skill} />
        <RunsCard skill={skill} />
        <FilesCard skill={skill} />
        <OriginCard skill={skill} />
        <MoreCard skill={skill} stage={stage} />
        <SkillSourceCard skill={skill} />
      </Bento>
      <SkillPager skill={skill} />
    </>
  );
}
