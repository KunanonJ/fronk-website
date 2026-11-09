import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight, FileText } from "lucide-react";
import CopyButton from "@/components/landing/skills/CopyButton";
import InstallTabs from "@/components/landing/skills/InstallTabs";
import SkillsPageShell from "@/components/landing/skills/SkillsPageShell";
import { Chip } from "@/components/ui/Chip";
import {
  CommandBlock,
  DownloadLink,
  ExternalLink,
  InvocationBadge,
  OriginBadge,
  SectionHeading,
  pillLinkClass,
  textLinkClass,
} from "@/components/landing/skills/SkillParts";
import {
  PACK_INSTALL,
  SKILLS_RELEASE_URL,
  SKILLS_TAG,
  copyrightHolder,
  formatBytes,
  getAdjacentSkills,
  getSkillStage,
  getStageSiblings,
  skillInstallCommands,
  sourceLabel,
  type Skill,
} from "@/lib/content/skills";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

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

export default function SkillDetailPage({ skill }: { skill: Skill }) {
  const stage = getSkillStage(skill.stage);
  const { prev, next } = getAdjacentSkills(skill.slug);
  const siblings = getStageSiblings(skill);
  const { npx, copyPath } = skillInstallCommands(skill);
  const sourceId = `skill-md-${skill.slug}`;

  const breadcrumb = (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-small text-ink-2">
        <li>
          <Link
            href="/skills"
            className={`inline-flex min-h-6 items-center ${textLinkClass}`}
          >
            Skills
          </Link>
        </li>
        <li aria-hidden className="flex items-center">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li>
          <span aria-current="page" className="font-mono text-ink">
            {skill.name}
          </span>
        </li>
      </ol>
    </nav>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-1.5">
      <OriginBadge skill={skill} />
      <InvocationBadge skill={skill} />
      <Chip>{skill.license}</Chip>
      <a
        href={SKILLS_RELEASE_URL}
        {...external}
        className="inline-flex min-h-6 items-center rounded-chip border border-hairline-strong bg-surface px-2.5 py-0.5 font-mono text-label uppercase text-ink-2 transition-colors duration-150 ease-smooth hover:border-ink/40 hover:text-ink"
      >
        Superstacks {SKILLS_TAG}
      </a>
    </div>
  );

  const tabs = [
    {
      id: "npx",
      label: "npx skills",
      panel: (
        <div className="space-y-3">
          <CommandBlock
            label={
              <>
                Installs only <code className="font-mono">{skill.name}</code>,
                globally, as a copy
              </>
            }
            command={npx}
            accessibleLabel={`Copy install command for ${skill.name}`}
            announcement={`Copied the install command for ${skill.name}`}
          />
          <p className="text-small text-ink-2">
            Third-party installer;{" "}
            <code className="font-mono">DISABLE_TELEMETRY=1</code> turns its
            telemetry off.
          </p>
        </div>
      ),
    },
    {
      id: "zip",
      label: "ZIP for Claude Code / Codex",
      panel: (
        <div className="space-y-4">
          <p className="text-small text-ink-2">
            Folder layout (
            <code className="font-mono">{skill.name}/SKILL.md</code>). Unzip it
            into your agent's skills directory.
          </p>
          <DownloadLink asset={skill.zip} primary>
            Download {skill.zip.name}
          </DownloadLink>
        </div>
      ),
    },
    {
      id: "flat",
      label: "ZIP for claude.ai / ChatGPT",
      panel: (
        <div className="space-y-4">
          <p className="text-small text-ink-2">
            Flat layout: <code className="font-mono">SKILL.md</code> sits at the
            zip root, ready to upload as a skill.
          </p>
          <DownloadLink asset={skill.flatZip} primary>
            Download {skill.flatZip.name}
          </DownloadLink>
        </div>
      ),
    },
    {
      id: "copy",
      label: "Plain copy",
      panel: (
        <div className="space-y-3">
          <CommandBlock
            label={
              <>
                Copy this folder from the{" "}
                <a
                  href={skill.folderUrl}
                  {...external}
                  className={textLinkClass}
                >
                  repo at {SKILLS_TAG}
                </a>{" "}
                into your agent's skills directory
              </>
            }
            command={copyPath}
            accessibleLabel={`Copy the repo path of ${skill.name}`}
            announcement={`Copied the ${skill.name} folder path`}
          />
        </div>
      ),
    },
    {
      id: "pack",
      label: "Full pack",
      panel: (
        <div className="space-y-4">
          <p className="text-small text-ink-2">
            <code className="font-mono">{skill.name}</code> ships in the
            Superstacks plugin with the other skills. In Claude Code:
          </p>
          <CommandBlock
            command={PACK_INSTALL.claudeCode.join("\n")}
            accessibleLabel="Copy the Claude Code plugin commands"
            announcement="Copied both plugin commands"
          />
          <p className="text-small text-ink-2">
            Run them one at a time. Codex, Cursor and ZIP steps are on{" "}
            <Link href="/skills" className={textLinkClass}>
              the Skills page
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];

  return (
    <SkillsPageShell
      eyebrow={`Skill · ${stage.label}`}
      title={skill.name}
      monoTitle
      description={<p>{skill.description}</p>}
      navId="skill-mobile-nav"
      breadcrumb={breadcrumb}
      meta={meta}
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <div className="min-w-0 space-y-14">
          <section aria-labelledby="skill-install">
            <SectionHeading id="skill-install">
              Install this skill
            </SectionHeading>
            <InstallTabs
              label={`Install ${skill.name} with`}
              idBase="skill-install"
              tabs={tabs}
            />
          </section>

          <section aria-labelledby="skill-when">
            <SectionHeading id="skill-when">How it runs</SectionHeading>
            <p className="text-body text-ink-2">
              {skill.userInvoked ? (
                <>
                  <strong className="font-medium text-ink">
                    You invoke it.
                  </strong>{" "}
                  Its frontmatter sets{" "}
                  <code className="font-mono">
                    disable-model-invocation: true
                  </code>
                  , so the agent never loads it on its own. Ask for it by name.
                </>
              ) : (
                <>
                  <strong className="font-medium text-ink">
                    Runs automatically.
                  </strong>{" "}
                  The agent loads it when a task matches the description above.
                  You can also ask for it by name.
                </>
              )}
            </p>
          </section>

          <section aria-labelledby="skill-source">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2
                id="skill-source"
                className="font-mono text-h3 font-medium text-ink"
              >
                SKILL.md
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <CopyButton
                  sourceId={sourceId}
                  accessibleLabel={`Copy the SKILL.md of ${skill.name}`}
                  announcement={`Copied the SKILL.md of ${skill.name}`}
                />
                <ExternalLink
                  href={skill.skillMdUrl}
                  accessibleLabel={`View on GitHub: ${skill.name} SKILL.md at ${SKILLS_TAG}`}
                >
                  View on GitHub
                </ExternalLink>
              </div>
            </div>
            <pre
              id={sourceId}
              className="whitespace-pre-wrap rounded-card border border-hairline bg-well p-5 font-mono text-small text-ink [overflow-wrap:anywhere] sm:p-6"
            >
              {skill.content}
            </pre>
          </section>
        </div>

        <aside className="space-y-10 lg:pt-1">
          <section aria-labelledby="skill-files">
            <h2
              id="skill-files"
              className="mb-4 font-mono text-label uppercase text-ink-2"
            >
              Files
            </h2>
            <ul className="divide-y divide-hairline border-y border-hairline">
              {orderedFiles(skill).map((file) => (
                <li key={file.path}>
                  <a
                    href={file.url}
                    {...external}
                    className="flex min-h-11 items-center justify-between gap-3 py-2 text-small text-ink transition-colors hover:text-link"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText
                        className="h-3.5 w-3.5 shrink-0 text-ink-2"
                        aria-hidden
                      />
                      <span className="font-mono [overflow-wrap:anywhere]">
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
                      <span className="sr-only"> (opens on GitHub)</span>
                    </span>
                    <span className="shrink-0 font-mono text-label tabular-nums text-ink-2">
                      {formatBytes(file.size)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="skill-credit">
            <h2
              id="skill-credit"
              className="mb-4 font-mono text-label uppercase text-ink-2"
            >
              {skill.source ? "Credit" : "Origin"}
            </h2>
            {skill.source ? (
              <div className="space-y-3 text-small text-ink-2">
                <p>
                  Adapted from{" "}
                  <a
                    href={skill.source.url}
                    {...external}
                    className={textLinkClass}
                  >
                    {sourceLabel(skill.source)}
                  </a>{" "}
                  by {copyrightHolder(skill.source.copyright)}.
                </p>
                <dl className="divide-y divide-hairline border-y border-hairline">
                  <div className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-ink-2">License</dt>
                    <dd className="text-right text-ink">
                      {skill.source.license}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-2.5">
                    <dt className="text-ink-2">Copyright</dt>
                    <dd className="text-right text-ink">
                      {skill.source.copyright.replace(/^Copyright\s*/, "")}
                    </dd>
                  </div>
                  {skill.source.sha ? (
                    <div className="flex items-baseline justify-between gap-4 py-2.5">
                      <dt className="text-ink-2">Pinned at</dt>
                      <dd className="text-right">
                        <a
                          href={
                            skill.upstreamUrl ??
                            `${skill.source.url}/tree/${skill.source.sha}`
                          }
                          {...external}
                          className={`font-mono ${textLinkClass}`}
                        >
                          {skill.source.sha.slice(0, 7)}
                          <span className="sr-only"> (upstream SKILL.md)</span>
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {skill.patches.length > 0 ? (
                  <p>
                    Patched in Superstacks:{" "}
                    {skill.patches.map((patch, index) => (
                      <span key={patch.name}>
                        {index > 0 ? ", " : null}
                        <a
                          href={patch.url}
                          {...external}
                          className={`font-mono ${textLinkClass}`}
                        >
                          {patch.name}
                        </a>
                      </span>
                    ))}
                    .
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-small text-ink-2">
                Written for Superstacks;{" "}
                <code className="font-mono">sources.lock.json</code> credits no
                upstream. Released under {skill.license} with the rest of the
                pack.
              </p>
            )}
            {skill.excerpts.map((excerpt) => (
              <p
                key={excerpt.name}
                className="mt-3 text-small text-ink-2"
              >
                Includes a credited excerpt from{" "}
                <a href={excerpt.url} {...external} className={textLinkClass}>
                  {sourceLabel(excerpt)}
                </a>
                : {excerpt.license}, {excerpt.copyright}.
              </p>
            ))}
          </section>

          {siblings.length > 0 ? (
            <section aria-labelledby="skill-siblings">
              <h2
                id="skill-siblings"
                className="mb-4 font-mono text-label uppercase text-ink-2"
              >
                More in {stage.label}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {siblings.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/skills/${s.slug}`}
                      className={`font-mono ${pillLinkClass}`}
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>

      {prev && next ? (
        <nav
          aria-label="More skills"
          className="mt-20 grid grid-cols-1 gap-4 border-t border-hairline pt-8 sm:grid-cols-2"
        >
          <Link
            href={`/skills/${prev.slug}`}
            className="group flex flex-col rounded-card border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-hairline-strong"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-ink-2">
              <ArrowLeft className="h-3 w-3" aria-hidden />
              Previous
            </span>
            <span className="mt-2 font-mono text-lead text-ink">
              {prev.name}
            </span>
          </Link>
          <Link
            href={`/skills/${next.slug}`}
            className="group flex flex-col rounded-card border border-hairline bg-surface p-5 text-right shadow-card transition-colors hover:border-hairline-strong sm:items-end"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-label uppercase text-ink-2">
              Next
              <ArrowRight className="h-3 w-3" aria-hidden />
            </span>
            <span className="mt-2 font-mono text-lead text-ink">
              {next.name}
            </span>
          </Link>
        </nav>
      ) : null}
    </SkillsPageShell>
  );
}
