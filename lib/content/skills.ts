/**
 * Skills hub: the agent skills in the public `KunanonJ/superstacks` plugin.
 *
 * Data: `skills.generated.json` is a committed snapshot written by
 * `scripts/sync-skills.mjs` (`pnpm skills:sync`). The build reads only that
 * file and never calls GitHub. Re-run the sync after cutting a release.
 *
 * This module is the editorial overlay on top of the snapshot: page copy, the
 * stage grouping, the pipeline order, and every install command template.
 * Install commands are copied from the superstacks README at the pinned tag;
 * the single-skill `-s <name>` form is the documented `--skill` flag of the
 * `skills` CLI (vercel-labs/skills docs/commands.md). Never invent flags here.
 *
 * Honesty rules: no invented install counts, ratings or testimonials. Show
 * only what the snapshot proves (version, file sizes, license). A skill is
 * "Original" only when `sources.lock.json` attributes it to no upstream.
 *
 * Server-only in practice: the snapshot carries every SKILL.md, so do not
 * import this module from a client component (pass strings as props instead).
 */

import snapshot from "@/lib/content/skills.generated.json";
import { PAGE_META } from "@/lib/content/pageMeta";

/* ─── Snapshot types ──────────────────────────────────────────────────────── */

export interface SkillAsset {
  name: string;
  /** Bytes, from the GitHub release. */
  size: number;
  url: string;
  /** `sha256:` and the hex digest of the file's bytes, from the GitHub release. */
  digest: string;
}

export interface SkillSource {
  name: string;
  url: string;
  /** Pinned upstream commit; null for excerpt-only credits. */
  sha: string | null;
  license: string;
  copyright: string;
  skills: readonly string[];
  note: string | null;
}

export type SkillStageId = "plan" | "build" | "verify-ship" | "operate";

export interface SkillStage {
  id: SkillStageId;
  label: string;
  blurb: string;
}

export interface SkillFile {
  /** Path inside the skill folder, e.g. `references/rubric.md`. */
  path: string;
  size: number;
  /** GitHub blob URL pinned to the release tag. */
  url: string;
}

export interface Skill {
  slug: string;
  name: string;
  /** Frontmatter description, "Use when ..." kept as written. */
  description: string;
  license: string;
  /** `disable-model-invocation: true`: the user calls it; the model never loads it on its own. */
  userInvoked: boolean;
  stage: SkillStageId;
  origin: "original" | "adapted";
  /** Upstream the skill was adapted from (null for originals). */
  source: SkillSource | null;
  /** The upstream SKILL.md at the pinned SHA, when the lock records it. */
  upstreamUrl: string | null;
  /** Credited excerpts (e.g. HumanLayer show-me inside `pr`). */
  excerpts: readonly SkillSource[];
  /** Vendor patches in superstacks that touch this skill, pinned to the tag. */
  patches: readonly { name: string; url: string }[];
  files: readonly SkillFile[];
  /** `<skill>.zip`: folder layout, `<skill>/SKILL.md`. */
  zip: SkillAsset;
  /** `<skill>-flat.zip`: `SKILL.md` at the zip root (claude.ai / ChatGPT upload). */
  flatZip: SkillAsset;
  /** The full SKILL.md, frontmatter included. */
  content: string;
  /** Path of the skill folder in the repo. */
  repoPath: string;
  folderUrl: string;
  skillMdUrl: string;
}

/* ─── Catalog facts ───────────────────────────────────────────────────────── */

export const SKILLS_REPO = snapshot.repo;
export const SKILLS_REPO_URL = snapshot.repoUrl;
export const SKILLS_TAG = snapshot.tag;
export const SKILLS_VERSION = snapshot.version;
export const SKILLS_RELEASE_URL = snapshot.releaseUrl;
/** Release day, `2026-10-06` (UTC, from the GitHub release). */
export const SKILLS_RELEASE_DATE = snapshot.publishedAt.slice(0, 10);
/** Release month for the hero pill, e.g. `Oct 2026`. */
export const SKILLS_RELEASE_MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(snapshot.publishedAt));
export const SKILLS_ROOT = snapshot.skillsRoot;
export const SKILLS_LICENSE = "MIT";
export const PLUGIN_ZIP: SkillAsset = snapshot.pluginZip;
/** The plugin folder at the tag (Cursor copies this whole folder). */
export const PLUGIN_FOLDER = SKILLS_ROOT.replace(/\/skills$/, "");

const blob = (repoPath: string) =>
  `${SKILLS_REPO_URL}/blob/${SKILLS_TAG}/${repoPath}`;
const tree = (repoPath: string) =>
  `${SKILLS_REPO_URL}/tree/${SKILLS_TAG}/${repoPath}`;

export const PLUGIN_FOLDER_URL = tree(PLUGIN_FOLDER);
export const THIRD_PARTY_URL = blob(`${PLUGIN_FOLDER}/THIRD_PARTY.md`);
export const SOURCES_LOCK_URL = blob("sources.lock.json");

export const SKILL_SOURCES: readonly SkillSource[] = snapshot.sources;

/* ─── Editorial overlay ───────────────────────────────────────────────────── */

export const skillsPage = {
  eyebrow: "Skills",
  title: "The agent skills I build with",
  /** The h1 as the canvas sets it: a muted word, then two lines of `title`. */
  headline: { muted: "The", rest: "agent skills", accent: "I build with" },
  description:
    "A skill is a folder of instructions an AI coding agent loads when the task calls for it: how to plan, test, review, or open a pull request. These are the twenty I use, packed as Superstacks, free under the MIT license.",
  metaDescription: PAGE_META.skills.description,
  askAgentPrompt: `Install the Superstacks skills from github.com/${SKILLS_REPO} using the steps in its README.`,
  /** Named on /skills and every skill page so engines tie the pack to him. */
  maintainer: { name: "Kunanon Jarat", href: "/about" },
} as const;

export const SKILL_STAGES: readonly SkillStage[] = [
  {
    id: "plan",
    label: "Plan",
    blurb: "Understand the code and pressure-test the plan before writing any.",
  },
  {
    id: "build",
    label: "Build",
    blurb: "Write the check first, then the code, and debug with evidence.",
  },
  {
    id: "verify-ship",
    label: "Verify and ship",
    blurb: "Prove it works, review it, and open a draft pull request.",
  },
  {
    id: "operate",
    label: "Operate and improve",
    blurb: "Run tickets end to end and turn repeated mistakes into guardrails.",
  },
];

/** Editorial grouping (owner reviews). Every skill sits in exactly one stage. */
export const SKILL_STAGE_MEMBERS: Readonly<
  Record<SkillStageId, readonly string[]>
> = {
  plan: [
    "how",
    "writing-plans",
    "grilling",
    "grill-with-docs",
    "domain-modeling",
    "interrogate",
  ],
  build: ["verify-loop", "test-driven-development", "diagnosing-bugs"],
  "verify-ship": ["verification-before-completion", "code-review", "pr"],
  operate: [
    "ticket-pipeline",
    "workflow-profile",
    "intake-triage",
    "gardening",
    "sample-review",
    "steer-miner",
    "mistake-to-constraint",
    "writing-for-agents",
  ],
};

/** The README's pipeline flow, in order. `interrogate` only for one-way doors. */
export const SKILL_PIPELINE: readonly { slug: string; note?: string }[] = [
  { slug: "how" },
  { slug: "writing-plans" },
  { slug: "verify-loop" },
  { slug: "test-driven-development" },
  { slug: "verification-before-completion" },
  { slug: "code-review" },
  { slug: "interrogate", note: "if one-way door" },
  { slug: "pr", note: "draft" },
];

/* ─── Install command templates (the only place commands are written) ─────── */

export const PACK_INSTALL = {
  claudeCode: [
    `/plugin marketplace add ${SKILLS_REPO}`,
    "/plugin install superstacks@superstacks",
  ],
  codex: `codex plugin marketplace add ${SKILLS_REPO}`,
  cursorFrom: `${PLUGIN_FOLDER}/`,
  cursorTo: "~/.cursor/plugins/local/superstacks/",
  npx: `DISABLE_TELEMETRY=1 npx skills add ${SKILLS_REPO} -g -s '*' --copy -y`,
} as const;

/** Single-skill commands for one skill. Same flags as the README, with `-s <name>`. */
export function skillInstallCommands(skill: Pick<Skill, "name" | "repoPath">) {
  return {
    npx: `DISABLE_TELEMETRY=1 npx skills add ${SKILLS_REPO} -g -s ${skill.name} --copy -y`,
    copyPath: `${skill.repoPath}/`,
  } as const;
}

/* ─── Build the catalog ───────────────────────────────────────────────────── */

const STAGE_BY_SLUG = new Map<string, SkillStageId>(
  (
    Object.entries(SKILL_STAGE_MEMBERS) as [SkillStageId, readonly string[]][]
  ).flatMap(([stage, slugs]) => slugs.map((slug) => [slug, stage] as const)),
);

const sourceByName = new Map(SKILL_SOURCES.map((s) => [s.name, s]));

type SnapshotSkill = (typeof snapshot.skills)[number];

function toSkill(raw: SnapshotSkill): Skill {
  const stage = STAGE_BY_SLUG.get(raw.name);
  if (!stage) {
    throw new Error(`Skill ${raw.name} has no stage in SKILL_STAGE_MEMBERS`);
  }
  const source = raw.source ? (sourceByName.get(raw.source) ?? null) : null;
  const repoPath = `${SKILLS_ROOT}/${raw.name}`;
  return {
    slug: raw.name,
    name: raw.name,
    description: raw.description,
    license: raw.license ?? SKILLS_LICENSE,
    userInvoked: raw.userInvoked,
    stage,
    origin: source ? "adapted" : "original",
    source,
    upstreamUrl:
      source?.sha && raw.upstreamPath
        ? `${source.url}/blob/${source.sha}/${raw.upstreamPath}`
        : null,
    excerpts: raw.excerptSources.flatMap((name) => {
      const s = sourceByName.get(name);
      return s ? [s] : [];
    }),
    patches: raw.patches.map((p) => ({
      name: p.replace(/^patches\//, ""),
      url: blob(p),
    })),
    files: raw.files.map((f) => ({
      path: f.path,
      size: f.size,
      url: blob(`${repoPath}/${f.path}`),
    })),
    zip: raw.zip,
    flatZip: raw.flatZip,
    content: raw.content,
    repoPath,
    folderUrl: tree(repoPath),
    skillMdUrl: blob(`${repoPath}/SKILL.md`),
  };
}

/** Catalog order: by stage, then the editorial order inside each stage. */
const SKILLS: readonly Skill[] = (() => {
  const bySlug = new Map(
    snapshot.skills.map((raw) => [raw.name, toSkill(raw)]),
  );
  const ordered: Skill[] = [];
  for (const stage of SKILL_STAGES) {
    for (const slug of SKILL_STAGE_MEMBERS[stage.id]) {
      const skill = bySlug.get(slug);
      if (skill) ordered.push(skill);
    }
  }
  return ordered;
})();

export function getAllSkills(): readonly Skill[] {
  return SKILLS;
}

export function getAllSkillSlugs(): string[] {
  return SKILLS.map((s) => s.slug);
}

export function getSkillBySlug(slug: string): Skill | null {
  return SKILLS.find((s) => s.slug === slug) ?? null;
}

export function getSkillsByStage(): readonly {
  stage: SkillStage;
  skills: readonly Skill[];
}[] {
  return SKILL_STAGES.map((stage) => ({
    stage,
    skills: SKILLS.filter((s) => s.stage === stage.id),
  }));
}

export function getSkillStage(id: SkillStageId): SkillStage {
  return SKILL_STAGES.find((s) => s.id === id)!;
}

/** Previous / next in catalog order, wrapping around. */
export function getAdjacentSkills(slug: string): {
  prev: Skill | null;
  next: Skill | null;
} {
  const index = SKILLS.findIndex((s) => s.slug === slug);
  if (index === -1) return { prev: null, next: null };
  const len = SKILLS.length;
  return {
    prev: SKILLS[(index - 1 + len) % len] ?? null,
    next: SKILLS[(index + 1) % len] ?? null,
  };
}

/** Other skills in the same stage, catalog order. */
export function getStageSiblings(skill: Skill): readonly Skill[] {
  return SKILLS.filter((s) => s.stage === skill.stage && s.slug !== skill.slug);
}

/* ─── Display helpers ─────────────────────────────────────────────────────── */

/** `3809` -> `3.7 KB`; under 1 KB stays in bytes. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
}

/** "Copyright (c) 2025 Jesse Vincent" -> "Jesse Vincent". */
export function copyrightHolder(copyright: string): string {
  return copyright
    .replace(/^Copyright\s*(\(c\)|©)?\s*\d{4}(\s*-\s*\d{4})?\s*/i, "")
    .trim();
}

/**
 * Short display name for an upstream: "cursor/plugins pstack" ->
 * "pstack (cursor/plugins)"; "humanlayer/skills show-me (excerpt in pr)" ->
 * "show-me (humanlayer/skills)".
 */
export function sourceLabel(source: SkillSource): string {
  const [repo = source.name, ...rest] = source.name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .split(" ");
  return rest.length > 0 ? `${rest.join(" ")} (${repo})` : repo;
}

export function skillTitle(skill: Skill): string {
  return `${skill.name}: agent skill`;
}

/** Description for meta tags and cards. */
export function skillMetaDescription(skill: Skill): string {
  const origin = skill.source
    ? `Adapted from ${skill.source.name} (${skill.source.license}).`
    : `Original, ${skill.license}.`;
  return `${skill.description.replace(/\.?$/, ".")} ${origin} Part of Superstacks ${SKILLS_TAG}.`;
}

export const ORIGINAL_COUNT = SKILLS.filter(
  (s) => s.origin === "original",
).length;
export const ADAPTED_COUNT = SKILLS.length - ORIGINAL_COUNT;
export const USER_INVOKED_COUNT = SKILLS.filter((s) => s.userInvoked).length;
export const MODEL_INVOKED_COUNT = SKILLS.length - USER_INVOKED_COUNT;
