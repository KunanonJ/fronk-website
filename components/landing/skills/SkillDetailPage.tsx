import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, FileText } from "lucide-react";
import Link from "@/components/navigation/Link";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import { pillClass } from "@/components/ds/Pill";
import { PageHero } from "@/components/profile/pages/PageHero";
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
  SlashBreaks,
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

/*
 * /skills/$slug (profile redesign Phase 7c; plan step 7c): the hero on the
 * pixel sky with the breadcrumb, then tiles. Every skill uses the same
 * template with its own data: adapted skills get an Origin tile with the
 * upstream, pinned commit and patches, user-invoked skills say so in How it
 * runs, and the Files tile lists whatever the folder holds. Styles:
 * `.pf-skill*` and `.pf-cat*` in src/styles/profile/pages-catalog.css.
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
    <PageHero
      back={
        <nav aria-label="Breadcrumb">
          <ol className="pf-skill-crumbs">
            <li>
              <Link href="/skills" className="ds-back">
                Skills
              </Link>
            </li>
            <li aria-hidden className="pf-skill-crumbs__sep">
              <ChevronRight size={14} />
            </li>
            <li>
              <span aria-current="page" className="pf-cat-code">
                {skill.name}
              </span>
            </li>
          </ol>
        </nav>
      }
      eyebrow={`Skill · ${stage.label}`}
      title={skill.name}
      titleClassName="pf-skill-hero__name"
      lead={skill.description}
    >
      <p className="t-small pf-cat-hero__meta">
        {skill.source ? "Adapted and maintained by" : "Written by"}{" "}
        <Link
          href={skillsPage.maintainer.href}
          rel="author"
          className="ds-prose-link"
        >
          {skillsPage.maintainer.name}
        </Link>
      </p>
      <ul aria-label="About this skill" className="pf-skill-chips">
        <SkillTags skill={skill} variant="hero" />
        <li className="ds-chip pf-skill-tag pf-cat-code">{skill.license}</li>
        <li>
          <a
            href={SKILLS_RELEASE_URL}
            aria-label={`Superstacks ${SKILLS_TAG}, release on GitHub`}
            {...EXTERNAL}
            className={pillClass({ variant: "ghost", size: "sm" })}
          >
            Superstacks <span className="pf-cat-code">{SKILLS_TAG}</span>
            <span className="ds-pill__icon" aria-hidden="true">
              <ArrowUpRightIcon size={12} />
            </span>
          </a>
        </li>
      </ul>
      <div className="pf-cat-hero__actions">
        <a
          href={skill.folderUrl}
          aria-label={`View on GitHub: ${skill.name}`}
          {...EXTERNAL}
          className={pillClass({ size: "hero" })}
        >
          View on GitHub
          <span className="ds-pill__icon" aria-hidden="true">
            <ArrowUpRightIcon size={16} />
          </span>
        </a>
        <SharePill />
      </div>
    </PageHero>
  );
}

function ZipPanel({ note, asset }: { note: ReactNode; asset: SkillAsset }) {
  return (
    <div className="pf-cat-stack pf-cat-stack--start">
      <p className={`${NOTE} pf-cat-measure`}>{note}</p>
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
        <div className="pf-cat-stack">
          <CommandRow
            label={
              <>
                Installs only <code className={CODE}>{skill.name}</code>,
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
        <div className="pf-cat-stack">
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
    <article
      id="install"
      aria-labelledby="card-install"
      className="ds-tile pf-skill-tile pf-skill-tile--install"
    >
      <h2 id="card-install" className="t-meta pf-cat-kicker">
        Install this skill
      </h2>
      <InstallTabs
        label={`Install ${skill.name} with`}
        idBase="skill-install"
        tabs={tabs}
        panelClassName="min-h-[196px]"
      />
    </article>
  );
}

/** Who loads the skill. No step list: only verify-loop's was hand-picked. */
function RunsCard({ skill }: { skill: Skill }) {
  return (
    <article aria-labelledby="card-runs" className="ds-tile pf-skill-tile">
      <h2 id="card-runs" className="t-meta pf-cat-kicker">
        How it runs
      </h2>
      <p className="t-lift-title pf-cat-title">
        {skill.userInvoked ? "You invoke it." : "Runs automatically."}
      </p>
      <p className={NOTE}>
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
    </article>
  );
}

function FilesCard({ skill }: { skill: Skill }) {
  return (
    <article aria-labelledby="card-files" className="ds-tile pf-skill-tile">
      <h2 id="card-files" className="t-meta pf-cat-kicker">
        Files
      </h2>
      <ul className="pf-skill-files">
        {orderedFiles(skill).map((file) => (
          <li key={file.path} className="pf-skill-files__item">
            <a href={file.url} {...EXTERNAL} className="pf-skill-files__link">
              <span className="pf-skill-files__name">
                <FileText aria-hidden size={15} strokeWidth={1.8} />
                <span className="pf-cat-code">
                  <SlashBreaks text={file.path} />
                </span>
              </span>
              {/* Read as "SKILL.md, 2.1 KB, opens on GitHub". */}
              <span className="sr-only">
                , {formatBytes(file.size)}, opens on GitHub
              </span>
              <span aria-hidden className="pf-count pf-cat-note">
                {formatBytes(file.size)}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <a
        href={skill.folderUrl}
        {...EXTERNAL}
        className="ds-text-link pf-skill-tile__end"
      >
        Folder on GitHub →
      </a>
    </article>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="pf-skill-facts__row">
      <dt className="pf-cat-note">{term}</dt>
      <dd className="pf-cat-code">{children}</dd>
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
    <article aria-labelledby="card-origin" className="ds-tile pf-skill-tile">
      <h2 id="card-origin" className="t-meta pf-cat-kicker">
        Origin
      </h2>
      <div>
        <p className="t-statement pf-cat-title">
          {source ? "Adapted" : "Original"}
        </p>
        <p className="t-meta pf-cat-note">
          {source ? `From ${sourceLabel(source)}` : "Written for Superstacks"}
        </p>
      </div>
      {source ? (
        <p className={NOTE}>
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
                    className="ds-prose-link pf-cat-code"
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
        <p className={NOTE}>
          Written for Superstacks;{" "}
          <a
            href={SOURCES_LOCK_URL}
            {...EXTERNAL}
            className="ds-prose-link pf-cat-code"
          >
            sources.lock.json
          </a>{" "}
          credits no upstream. Released under {skill.license} with the rest of
          the pack.
        </p>
      )}
      {skill.excerpts.map((excerpt) => (
        <p key={excerpt.name} className={NOTE}>
          Includes a credited excerpt from{" "}
          <a href={excerpt.url} {...EXTERNAL} className={INLINE_LINK}>
            {sourceLabel(excerpt)}
          </a>
          : {excerpt.license}, {excerpt.copyright}.
        </p>
      ))}
      <dl className="pf-skill-facts">
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
              className="pf-skill-facts__link"
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
    </article>
  );
}

function MoreCard({ skill, stage }: { skill: Skill; stage: SkillStage }) {
  const siblings = getStageSiblings(skill);
  return (
    <article aria-labelledby="card-more" className="ds-tile pf-skill-tile">
      <h2 id="card-more" className="t-meta pf-cat-kicker">
        More in {stage.label}
      </h2>
      <p className="t-lift-title pf-cat-title">{stage.blurb}</p>
      {siblings.length > 0 ? (
        <ul className="pf-skill-chips">
          {siblings.map((s) => (
            <li key={s.slug} className="pf-skill-chips__item">
              <Link
                href={`/skills/${s.slug}`}
                className={cn(
                  pillClass({ variant: "ghost", size: "sm" }),
                  "pf-skill-sibling",
                )}
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href="/skills#catalog" className="ds-text-link pf-skill-tile__end">
        All {getAllSkills().length} skills →
      </Link>
    </article>
  );
}

/** Previous and next in catalog order, wrapping around. */
function SkillPager({ skill }: { skill: Skill }) {
  const { prev, next } = getAdjacentSkills(skill.slug);
  if (!prev || !next) return null;
  return (
    <nav aria-label="More skills" className="pf-skill-pager">
      <Link href={`/skills/${prev.slug}`} className="pf-skill-pager__link">
        <span className="t-meta pf-skill-pager__label">
          <ArrowLeft aria-hidden size={12} />
          Previous · {getSkillStage(prev.stage).label}
        </span>
        <span className="pf-skill-pager__name">{prev.name}</span>
      </Link>
      <Link
        href={`/skills/${next.slug}`}
        className="pf-skill-pager__link pf-skill-pager__link--next"
      >
        <span className="t-meta pf-skill-pager__label">
          Next · {getSkillStage(next.stage).label}
          <ArrowRight aria-hidden size={12} />
        </span>
        <span className="pf-skill-pager__name">{next.name}</span>
      </Link>
    </nav>
  );
}

export default function SkillDetailPage({ skill }: { skill: Skill }) {
  const stage = getSkillStage(skill.stage);
  return (
    <>
      <SkillHero skill={skill} stage={stage} />
      <div className="ds-wrap pf-cat-section pf-cat-end pf-skill-body">
        <div className="pf-skill-grid">
          <InstallCard skill={skill} />
          <RunsCard skill={skill} />
          <FilesCard skill={skill} />
          <OriginCard skill={skill} />
          <MoreCard skill={skill} stage={stage} />
          <SkillSourceCard skill={skill} />
        </div>
        <SkillPager skill={skill} />
      </div>
    </>
  );
}
