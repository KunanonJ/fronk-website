import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CopyButton from "@/components/landing/skills/CopyButton";
import InstallTabs from "@/components/landing/skills/InstallTabs";
import SkillCard from "@/components/landing/skills/SkillCard";
import SkillsPageShell from "@/components/landing/skills/SkillsPageShell";
import {
  CommandBlock,
  DownloadLink,
  ExternalLink,
  SectionHeading,
  textLinkClass,
} from "@/components/landing/skills/SkillParts";
import {
  ADAPTED_COUNT,
  MODEL_INVOKED_COUNT,
  ORIGINAL_COUNT,
  PACK_INSTALL,
  PLUGIN_FOLDER_URL,
  PLUGIN_ZIP,
  SKILL_PIPELINE,
  SKILL_SOURCES,
  SKILLS_RELEASE_URL,
  SKILLS_REPO_URL,
  SKILLS_TAG,
  SOURCES_LOCK_URL,
  THIRD_PARTY_URL,
  USER_INVOKED_COUNT,
  getAllSkills,
  getSkillBySlug,
  getSkillsByStage,
  skillsPage,
  sourceLabel,
} from "@/lib/content/skills";

type FilterId = "all" | "original" | "adapted" | "auto" | "user";

const FILTERS: readonly { id: FilterId; label: string; count: number }[] = [
  { id: "all", label: "All", count: ORIGINAL_COUNT + ADAPTED_COUNT },
  { id: "original", label: "Original", count: ORIGINAL_COUNT },
  { id: "adapted", label: "Adapted", count: ADAPTED_COUNT },
  { id: "auto", label: "Runs automatically", count: MODEL_INVOKED_COUNT },
  { id: "user", label: "You invoke", count: USER_INVOKED_COUNT },
];

/** Card attribute each filter hides, and the stage marker it needs. */
const FILTER_RULES: Record<
  Exclude<FilterId, "all">,
  { hide: string; kind: string }
> = {
  original: { hide: '[data-origin="adapted"]', kind: "original" },
  adapted: { hide: '[data-origin="original"]', kind: "adapted" },
  auto: { hide: '[data-invocation="user"]', kind: "auto" },
  user: { hide: '[data-invocation="model"]', kind: "user" },
};

/**
 * CSS-only filter: radio inputs + `:has()`. No client JS, works before
 * hydration, and stages with no matching skill hide with their cards.
 * Browsers without `:has()` simply show everything.
 */
const FILTER_CSS = (Object.keys(FILTER_RULES) as Exclude<FilterId, "all">[])
  .map((id) => {
    const { hide, kind } = FILTER_RULES[id];
    const on = `.skills-catalog:has(#skills-filter-${id}:checked)`;
    return `${on} .skill-card${hide}, ${on} .skills-stage:not([data-kinds~="${kind}"]) { display: none; }`;
  })
  .join("\n");

const shortSha = (sha: string) => sha.slice(0, 7);

export default function SkillsIndexPage() {
  const stages = getSkillsByStage();
  const total = getAllSkills().length;

  const meta = (
    <div className="flex flex-wrap items-center gap-2">
      <ExternalLink
        href={SKILLS_RELEASE_URL}
        accessibleLabel={`Release ${SKILLS_TAG} on GitHub`}
      >
        <span className="font-mono">{SKILLS_TAG}</span>
      </ExternalLink>
      <ExternalLink
        href={SKILLS_REPO_URL}
        accessibleLabel="View on GitHub: KunanonJ/superstacks"
      >
        View on GitHub
      </ExternalLink>
      <p className="px-1 text-small text-ink-2">
        {total} skills · MIT license · {ORIGINAL_COUNT} original,{" "}
        {ADAPTED_COUNT} adapted
      </p>
    </div>
  );

  const packTabs = [
    {
      id: "claude-code",
      label: "Claude Code",
      panel: (
        <div className="space-y-4">
          <CommandBlock
            label="1. Add the marketplace (type it in Claude Code)"
            command={PACK_INSTALL.claudeCode[0]}
            accessibleLabel="Copy the Claude Code marketplace command"
            announcement="Copied the marketplace command"
          />
          <CommandBlock
            label="2. Install the plugin"
            command={PACK_INSTALL.claudeCode[1]}
            accessibleLabel="Copy the Claude Code plugin install command"
            announcement="Copied the plugin install command"
          />
          <p className="text-small text-ink-2">
            Installs all {total} skills as one plugin, named{" "}
            <code className="font-mono">superstacks</code>.
          </p>
        </div>
      ),
    },
    {
      id: "codex",
      label: "Codex",
      panel: (
        <CommandBlock
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
        <div className="space-y-4">
          <p className="text-small text-ink-2">
            Until the public Cursor listing exists, copy the{" "}
            <a
              href={PLUGIN_FOLDER_URL}
              className={textLinkClass}
              target="_blank"
              rel="noopener noreferrer"
            >
              <code className="font-mono">{PACK_INSTALL.cursorFrom}</code>
            </a>{" "}
            folder from the repo into this folder:
          </p>
          <CommandBlock
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
        <div className="space-y-4">
          <CommandBlock
            label="Installs every skill globally for the agents it finds"
            command={PACK_INSTALL.npx}
            accessibleLabel="Copy the npx skills command for the whole pack"
            announcement="Copied the npx skills command"
          />
          <p className="text-small text-ink-2">
            <code className="font-mono">npx skills</code> is a third-party
            installer; <code className="font-mono">DISABLE_TELEMETRY=1</code>{" "}
            turns its telemetry off.
          </p>
        </div>
      ),
    },
    {
      id: "zip",
      label: "ZIP (claude.ai / ChatGPT)",
      panel: (
        <div className="space-y-4">
          <p className="text-small text-ink-2">
            claude.ai and ChatGPT take one skill per ZIP: use the ZIP link on
            any skill below. For the OpenAI plugin portal, upload the whole pack
            as one file.
          </p>
          <DownloadLink asset={PLUGIN_ZIP} primary>
            Download plugin ZIP
          </DownloadLink>
        </div>
      ),
    },
  ];

  return (
    <SkillsPageShell
      eyebrow={skillsPage.eyebrow}
      title={skillsPage.title}
      description={<p>{skillsPage.description}</p>}
      navId="skills-mobile-nav"
      meta={meta}
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="skills-install">
          <SectionHeading id="skills-install">
            Install the whole pack
          </SectionHeading>
          <InstallTabs
            label="Install the whole pack with"
            idBase="pack-install"
            tabs={packTabs}
          />
        </section>

        <section aria-labelledby="skills-ask">
          <SectionHeading id="skills-ask">Or ask your agent</SectionHeading>
          <p className="mb-4 text-small text-ink-2">
            Paste this into Claude Code, Codex or Cursor and let it follow the
            README.
          </p>
          <figure className="rounded-card border border-hairline bg-surface-tint p-5 sm:p-6">
            <p id="skills-ask-prompt" className="text-lead text-ink">
              {skillsPage.askAgentPrompt}
            </p>
            <figcaption className="mt-4 flex justify-end">
              <CopyButton
                sourceId="skills-ask-prompt"
                label="Copy prompt"
                accessibleLabel="Copy prompt for your agent"
                announcement="Copied the prompt"
              />
            </figcaption>
          </figure>
        </section>
      </div>

      <section aria-labelledby="skills-pipeline" className="mt-20">
        <SectionHeading id="skills-pipeline">The pipeline</SectionHeading>
        <p className="mb-5 max-w-2xl text-small text-ink-2">
          The order the skills run in on a ticket, from the Superstacks README.{" "}
          <Link href="/skills/ticket-pipeline" className={textLinkClass}>
            ticket-pipeline
          </Link>{" "}
          routes a ticket through it.
        </p>
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
          {SKILL_PIPELINE.map((step, index) => {
            const skill = getSkillBySlug(step.slug);
            if (!skill) return null;
            return (
              <li key={step.slug} className="flex items-center gap-1">
                <Link
                  href={`/skills/${skill.slug}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-full border border-hairline-strong bg-surface px-3.5 text-sm text-ink transition-colors duration-150 ease-smooth hover:border-ink/40 hover:bg-surface-tint"
                >
                  <span className="font-mono text-label tabular-nums text-ink-2">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono">{skill.name}</span>
                  {step.note ? (
                    <span className="text-small text-ink-2">
                      ({step.note})
                    </span>
                  ) : null}
                </Link>
                {index < SKILL_PIPELINE.length - 1 ? (
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-ink-2"
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </section>

      <section
        aria-labelledby="skills-catalog"
        className="skills-catalog mt-20"
      >
        <style>{FILTER_CSS}</style>
        <SectionHeading id="skills-catalog">All {total} skills</SectionHeading>
        <fieldset className="mb-10">
          <legend className="mb-3 font-mono text-label uppercase text-ink-2">
            Show
          </legend>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <label
                key={filter.id}
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-hairline-strong bg-surface px-4 text-sm text-ink-2 transition-colors duration-150 ease-smooth hover:border-ink/40 hover:text-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:font-medium has-[:checked]:text-page has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus has-[:focus-visible]:outline-solid"
              >
                <input
                  type="radio"
                  name="skills-filter"
                  id={`skills-filter-${filter.id}`}
                  value={filter.id}
                  defaultChecked={filter.id === "all"}
                  className="sr-only"
                />
                {filter.label}
                <span className="font-mono text-label tabular-nums">{filter.count}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-14">
          {stages.map(({ stage, skills }) => {
            const kinds = new Set<string>();
            for (const s of skills) {
              kinds.add(s.origin);
              kinds.add(s.userInvoked ? "user" : "auto");
            }
            return (
              <section
                key={stage.id}
                aria-labelledby={`skills-stage-${stage.id}`}
                className="skills-stage"
                data-kinds={[...kinds].sort().join(" ")}
              >
                <div className="mb-5 flex flex-col gap-1 border-b border-hairline pb-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <SectionHeading id={`skills-stage-${stage.id}`} as="h3">
                    {stage.label}
                  </SectionHeading>
                  <p className="text-small text-ink-2">{stage.blurb}</p>
                </div>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {skills.map((skill) => (
                    <SkillCard key={skill.slug} skill={skill} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="skills-credits" className="mt-20">
        <SectionHeading id="skills-credits">Credits</SectionHeading>
        <p className="mb-6 max-w-2xl text-small text-ink-2">
          {ADAPTED_COUNT} skills are adapted from these MIT-licensed projects,
          pinned to a commit and patched where noted. Full notices are in{" "}
          <a
            href={THIRD_PARTY_URL}
            className={textLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            THIRD_PARTY.md
          </a>{" "}
          and pins in{" "}
          <a
            href={SOURCES_LOCK_URL}
            className={textLinkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            sources.lock.json
          </a>
          .
        </p>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SKILL_SOURCES.map((source) => (
            <li
              key={source.name}
              className="rounded-card border border-hairline bg-surface p-5 sm:p-6"
            >
              <p className="font-mono text-body text-ink">
                <a
                  href={source.url}
                  className={`inline-flex min-h-6 items-center ${textLinkClass}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sourceLabel(source)}
                </a>
              </p>
              <p className="mt-2 text-small text-ink-2">
                {source.license} · {source.copyright}
              </p>
              {source.sha ? (
                <p className="mt-1 text-small text-ink-2">
                  Pinned at{" "}
                  <a
                    href={`${source.url}/tree/${source.sha}`}
                    className={`font-mono ${textLinkClass}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {shortSha(source.sha)}
                  </a>
                </p>
              ) : null}
              {source.skills.length > 0 ? (
                <ul
                  className="mt-3 flex flex-wrap gap-x-3 gap-y-1"
                  aria-label={`Skills adapted from ${sourceLabel(source)}`}
                >
                  {source.skills.map((slug) => (
                    <li key={slug}>
                      <Link
                        href={`/skills/${slug}`}
                        className={`inline-flex min-h-6 min-w-6 items-center justify-center font-mono text-sm ${textLinkClass}`}
                      >
                        {slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-small text-ink-2">
                  Credited excerpt inside{" "}
                  {getAllSkills()
                    .filter((s) =>
                      s.excerpts.some((e) => e.name === source.name),
                    )
                    .map((s) => (
                      <Link
                        key={s.slug}
                        href={`/skills/${s.slug}`}
                        className={`font-mono ${textLinkClass}`}
                      >
                        {s.name}
                      </Link>
                    ))}
                  .{source.note ? ` ${source.note}` : null}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </SkillsPageShell>
  );
}
