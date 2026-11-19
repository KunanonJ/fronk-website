import Link from "@/components/navigation/Link";
import { ArrowUpRightIcon } from "@/components/bento/icons";
import SharePill from "@/components/bento/SharePill";
import { EyebrowRow } from "@/components/ds/labels";
import { pillClass } from "@/components/ds/Pill";
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
import { PageHero } from "@/components/profile/pages/PageHero";

const TOTAL = ORIGINAL_COUNT + ADAPTED_COUNT;

/*
 * /skills (profile redesign Phase 7c; plan step 7c): the hero on the pixel
 * sky, the install tiles (whole pack, ask your agent, the pipeline as case
 * steps), the filterable catalog of skill tiles and the credits as a fact
 * strip. Copy and commands come from lib/content/skills and its snapshot;
 * nothing here is written by hand. Styles: `.pf-skill*` and `.pf-cat*` in
 * src/styles/profile/pages-catalog.css.
 */

function SkillsHero() {
  const { headline } = skillsPage;
  return (
    <PageHero
      eyebrow={skillsPage.eyebrow}
      lines={[
        [{ text: headline.muted, tone: "muted" }, { text: headline.rest }],
        [{ text: headline.accent, tone: "accent" }],
      ]}
      lead={skillsPage.description}
    >
      <div className="pf-cat-hero__actions">
        <a
          href={SKILLS_REPO_URL}
          aria-label={`View on GitHub: ${SKILLS_REPO}`}
          {...EXTERNAL}
          className={pillClass({ size: "hero" })}
        >
          View on GitHub
          <span className="ds-pill__icon" aria-hidden="true">
            <ArrowUpRightIcon size={16} />
          </span>
        </a>
        <SharePill />
        <a
          href={SKILLS_RELEASE_URL}
          aria-label={`Superstacks ${SKILLS_TAG} · ${SKILLS_RELEASE_MONTH}, release on GitHub`}
          {...EXTERNAL}
          className={cn(pillClass({ variant: "ghost" }), "pf-skill-release")}
        >
          <span aria-hidden className="pf-skill-tag__mark" />
          <span>
            Superstacks <span className="pf-cat-code">{SKILLS_TAG}</span>
          </span>
          <span className="pf-cat-note">· {SKILLS_RELEASE_MONTH}</span>
          <span className="ds-pill__icon" aria-hidden="true">
            <ArrowUpRightIcon size={14} />
          </span>
        </a>
      </div>
      <p className="t-small pf-cat-hero__meta">
        {TOTAL} skills · MIT license · {ORIGINAL_COUNT} original,{" "}
        {ADAPTED_COUNT} adapted · maintained by{" "}
        <Link
          href={skillsPage.maintainer.href}
          rel="author"
          className="ds-prose-link"
        >
          {skillsPage.maintainer.name}
        </Link>
      </p>
    </PageHero>
  );
}

const packTabs = [
  {
    id: "claude-code",
    label: "Claude Code",
    panel: (
      <div className="pf-cat-stack">
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
      <div className="pf-cat-stack">
        <p className={NOTE}>
          Until the public Cursor listing exists, copy the{" "}
          <a
            href={PLUGIN_FOLDER_URL}
            {...EXTERNAL}
            className="ds-prose-link pf-cat-code"
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
      <div className="pf-cat-stack">
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
      <div className="pf-cat-stack pf-cat-stack--start">
        <p className={`${NOTE} pf-cat-measure`}>
          claude.ai and ChatGPT take one skill per ZIP: use the ZIP link on any
          skill below. For the OpenAI plugin portal, upload the whole pack as
          one file.
        </p>
        <DownloadCta asset={PLUGIN_ZIP} label="Download plugin ZIP" />
      </div>
    ),
  },
];

/**
 * The README's pipeline as the case template's steps (spec 9.13): numbered
 * cards in order, each a link to its skill.
 */
function PipelineCard() {
  const steps = SKILL_PIPELINE.flatMap((step) => {
    const skill = getSkillBySlug(step.slug);
    return skill ? [{ ...step, name: skill.name }] : [];
  });
  return (
    <article
      id="pipeline"
      aria-labelledby="card-pipeline"
      className="ds-tile pf-skill-tile pf-skill-tile--wide"
    >
      <h2 id="card-pipeline" className="t-meta pf-cat-kicker">
        The pipeline
      </h2>
      <p className={`${NOTE} pf-cat-measure`}>
        The order the skills run in on a ticket, from the Superstacks README.{" "}
        <Link
          href="/skills/ticket-pipeline"
          className="ds-prose-link pf-cat-code"
        >
          ticket-pipeline
        </Link>{" "}
        routes a ticket through it.
      </p>
      <ol className="pf-skill-steps">
        {steps.map((step, index) => (
          <li key={step.slug} className="pf-skill-steps__item">
            <Link href={`/skills/${step.slug}`} className="pf-skill-step">
              <span aria-hidden className="t-meta pf-skill-step__number">
                {pad2(index + 1)}
              </span>
              <span className="pf-skill-step__name">{step.name}</span>
              {step.note ? (
                <span className="pf-skill-step__note">({step.note})</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </article>
  );
}

function InstallRow() {
  return (
    <div className="ds-wrap pf-cat-section pf-skill-install">
      <article
        id="install"
        aria-labelledby="card-install"
        className="ds-tile pf-skill-tile pf-skill-tile--install"
      >
        <h2 id="card-install" className="t-meta pf-cat-kicker">
          Install the whole pack
        </h2>
        <InstallTabs
          label="Install the whole pack with"
          idBase="pack-install"
          tabs={packTabs}
          panelClassName="min-h-[252px]"
        />
      </article>
      <article aria-labelledby="card-ask" className="ds-tile pf-skill-tile">
        <h2 id="card-ask" className="t-meta pf-cat-kicker">
          Or ask your agent
        </h2>
        <p className={NOTE}>
          Paste this into Claude Code, Codex or Cursor and let it follow the
          README.
        </p>
        <figure className="pf-skill-prompt">
          <p className="pf-skill-prompt__text">{skillsPage.askAgentPrompt}</p>
          <figcaption className="pf-skill-prompt__actions">
            <CopyButton
              text={skillsPage.askAgentPrompt}
              label="Copy prompt"
              size="prompt"
              accessibleLabel="Copy prompt for your agent"
              announcement="Copied the prompt"
            />
          </figcaption>
        </figure>
      </article>
      <PipelineCard />
    </div>
  );
}

const shortSha = (sha: string) => sha.slice(0, 7);

/**
 * Upstream projects as a fact strip (spec 9.8): one row between hairlines
 * per project, with its license, pinned commit and the skills taken from it.
 */
function CreditsCard() {
  return (
    <article
      aria-labelledby="card-credits"
      className="ds-wrap pf-cat-section pf-cat-end"
    >
      <EyebrowRow as="h2" id="card-credits">
        Credits
      </EyebrowRow>
      <p className={`${NOTE} pf-cat-measure`}>
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
      <ul className="pf-skill-credits">
        {SKILL_SOURCES.map((source) => {
          const label = sourceLabel(source);
          return (
            <li key={source.name} className="pf-skill-credits__row">
              <h3 className="pf-skill-credits__name">
                <a
                  href={source.url}
                  {...EXTERNAL}
                  className="pf-skill-credits__link"
                >
                  {label}
                </a>
              </h3>
              <p className="t-small pf-cat-note">
                {source.license} · {source.copyright}
              </p>
              {source.sha ? (
                <p className="t-small pf-cat-note pf-skill-credits__pin">
                  Pinned at{" "}
                  <a
                    href={`${source.url}/tree/${source.sha}`}
                    {...EXTERNAL}
                    className="pf-skill-credits__sha"
                  >
                    {shortSha(source.sha)}
                  </a>
                </p>
              ) : null}
              {source.skills.length > 0 ? (
                <ul
                  aria-label={`Skills adapted from ${label}`}
                  className="pf-skill-credits__skills"
                >
                  {source.skills.map((slug) => (
                    <li key={slug}>
                      {/* Short slugs such as "pr" get a 24 px tap area from
                          padding the negative margin takes back; with the
                          16 px gap, neighbouring areas stay 4 px apart. */}
                      <Link
                        href={`/skills/${slug}`}
                        className="pf-skill-credits__skill"
                      >
                        {slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="t-small pf-cat-note pf-skill-credits__excerpt">
                  Credited excerpt inside{" "}
                  {getAllSkills()
                    .filter((s) =>
                      s.excerpts.some((e) => e.name === source.name),
                    )
                    .map((s) => (
                      <Link
                        key={s.slug}
                        href={`/skills/${s.slug}`}
                        className="ds-prose-link pf-cat-code"
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
    </article>
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
      <div className="ds-wrap pf-cat-section">
        <SkillsCatalog show={show} onShowChange={onShowChange} />
      </div>
      <CreditsCard />
    </>
  );
}
