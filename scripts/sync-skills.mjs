#!/usr/bin/env node
/**
 * Skills snapshot sync: KunanonJ/superstacks at a release tag ->
 * `lib/content/skills.generated.json` (committed).
 *
 *   pnpm skills:sync                 # default tag (DEFAULT_TAG below)
 *   pnpm skills:sync --tag v6.2.0    # after cutting a new release
 *   pnpm skills:sync --check         # exit 1 if the snapshot is out of date
 *
 * Why a snapshot: `/skills` is built from this file only, so builds never call
 * GitHub, stay deterministic, and cannot be broken by API rate limits. The
 * owner re-runs the sync after each superstacks release.
 *
 * Reads (all pinned to the tag): the git tree (skill folders and file lists),
 * every `SKILL.md`, `sources.lock.json`, the `patches/` names, and the release
 * assets (names, sizes, digests, download URLs). `GITHUB_TOKEN` is used when set.
 *
 * Output is stable: arrays are sorted, there is no timestamp, so re-running
 * against the same tag produces a byte-identical file.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const REPO = "KunanonJ/superstacks";
export const REPO_URL = `https://github.com/${REPO}`;
export const SKILLS_ROOT = "plugins/superstacks/skills";
export const DEFAULT_TAG = "v6.1.1";
export const OUTPUT_PATH = "lib/content/skills.generated.json";
export const PLUGIN_ZIP = "superstacks-plugin.zip";

/* ─── Frontmatter ──────────────────────────────────────────────────────────── */

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "") return "";
  if (value.startsWith('"')) {
    if (!value.endsWith('"') || value.length < 2) {
      throw new Error(`Unterminated double-quoted value: ${value}`);
    }
    return JSON.parse(value);
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'") || value.length < 2) {
      throw new Error(`Unterminated single-quoted value: ${value}`);
    }
    return value.slice(1, -1).replace(/''/g, "'");
  }
  // Strip a trailing comment on plain scalars (`key: value # note`).
  const plain = value.replace(/\s+#.*$/, "");
  if (plain === "true") return true;
  if (plain === "false") return false;
  if (plain === "null" || plain === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(plain)) return Number(plain);
  return plain;
}

const indentOf = (line) => line.length - line.trimStart().length;
const isSkippable = (line) => line.trim() === "" || line.trim().startsWith("#");

/**
 * Parse the YAML subset used by SKILL.md frontmatter: `key: value` scalars
 * (plain, quoted, booleans, numbers, null), nested maps by indentation,
 * `- item` scalar lists, and `|` / `>` block scalars. Anything else throws, so
 * a new upstream syntax fails the sync loudly instead of being misread.
 */
function parseYamlBlock(lines, start, indent) {
  const out = {};
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (isSkippable(line)) {
      i += 1;
      continue;
    }
    const lineIndent = indentOf(line);
    if (lineIndent < indent) break;
    if (lineIndent > indent) {
      throw new Error(`Unexpected indentation in frontmatter: "${line}"`);
    }
    const match = /^([A-Za-z0-9_.-]+):(?:\s+(.*))?$/.exec(line.trim());
    if (!match) throw new Error(`Unsupported frontmatter line: "${line}"`);
    const [, key, rest = ""] = match;
    i += 1;

    if (/^[|>][+-]?$/.test(rest.trim())) {
      const folded = rest.trim().startsWith(">");
      const block = [];
      let blockIndent = -1;
      while (i < lines.length) {
        const next = lines[i];
        if (next.trim() !== "" && indentOf(next) <= indent) break;
        if (next.trim() !== "" && blockIndent === -1)
          blockIndent = indentOf(next);
        block.push(
          next.trim() === "" ? "" : next.slice(Math.max(blockIndent, 0)),
        );
        i += 1;
      }
      while (block.length > 0 && block[block.length - 1] === "") block.pop();
      out[key] = folded
        ? block
            .join("\n")
            .split(/\n{2,}/)
            .map((paragraph) => paragraph.split("\n").join(" "))
            .join("\n")
        : block.join("\n");
      continue;
    }

    if (rest.trim() !== "") {
      out[key] = parseScalar(rest);
      continue;
    }

    // Empty value: a nested map, a list, or an empty string.
    let j = i;
    while (j < lines.length && isSkippable(lines[j])) j += 1;
    if (j >= lines.length || indentOf(lines[j]) <= indent) {
      out[key] = "";
      continue;
    }
    const childIndent = indentOf(lines[j]);
    if (lines[j].trim().startsWith("- ") || lines[j].trim() === "-") {
      const items = [];
      i = j;
      while (i < lines.length) {
        const next = lines[i];
        if (isSkippable(next)) {
          i += 1;
          continue;
        }
        if (indentOf(next) < childIndent) break;
        const item = /^-\s*(.*)$/.exec(next.trim());
        if (!item || indentOf(next) !== childIndent) {
          throw new Error(`Unsupported list item in frontmatter: "${next}"`);
        }
        items.push(parseScalar(item[1]));
        i += 1;
      }
      out[key] = items;
      continue;
    }
    const nested = parseYamlBlock(lines, j, childIndent);
    out[key] = nested.value;
    i = nested.next;
  }
  return { value: out, next: i };
}

/**
 * Split a markdown file into `{ data, body }`. Files without a leading `---`
 * fence return `data: {}` and the whole text as body.
 *
 * @param {string} text
 * @returns {{ data: Record<string, any>, body: string }}
 */
export function parseFrontmatter(text) {
  const normalized = String(text).replace(/\r\n?/g, "\n");
  if (!normalized.startsWith("---\n")) return { data: {}, body: normalized };
  const close = /\n---[ \t]*(?:\n|$)/.exec(normalized.slice(3));
  if (!close) throw new Error("Frontmatter has no closing --- fence");
  const yaml = normalized.slice(4, 3 + close.index);
  const body = normalized.slice(3 + close.index + close[0].length);
  const { value } = parseYamlBlock(yaml.split("\n"), 0, 0);
  return { data: value, body };
}

/* ─── Snapshot ─────────────────────────────────────────────────────────────── */

const byString = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function assetFor(assetsByName, name, skill) {
  const asset = assetsByName.get(name);
  if (!asset) {
    throw new Error(
      `Release is missing asset ${name}${skill ? ` for ${skill}` : ""}`,
    );
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(asset.digest ?? "")) {
    throw new Error(
      `Release asset ${name} has no sha256 digest (the Agent Skills index needs one)`,
    );
  }
  return {
    name: asset.name,
    size: asset.size,
    url: asset.url,
    digest: asset.digest,
  };
}

/** `how-v6.1.patch` -> `how`; file patches map back through sources.lock `copied`. */
function skillForPatch(patchFile, skillNames, copied) {
  const base = path.posix
    .basename(patchFile, ".patch")
    .replace(/-v\d+(?:\.\d+)*$/, "");
  if (skillNames.has(base)) return base;
  for (const copiedPath of Object.keys(copied ?? {})) {
    const match = /^skills\/([^/]+)\/(.+)$/.exec(copiedPath);
    if (!match) continue;
    const fileBase = path.posix.basename(match[2]).replace(/\.[^.]+$/, "");
    if (fileBase === base && skillNames.has(match[1])) return match[1];
  }
  return null;
}

/**
 * Pure: raw GitHub inputs -> the committed snapshot. Throws when the release
 * and the repo disagree (a skill without its ZIPs, a lock entry naming a
 * missing skill, a SKILL.md whose `name` differs from its folder).
 *
 * @param {{
 *   tag: string,
 *   release: { tag_name: string, html_url: string, published_at: string,
 *     assets: { name: string, size: number, digest?: string, browser_download_url: string }[] },
 *   tree: { path: string, type: string, size?: number }[],
 *   skillFiles: Record<string, string>,
 *   sourcesLock: { version: string, sources: Record<string, unknown>[],
 *     copied?: Record<string, { source: string, source_path: string }> },
 * }} raw
 */
export function buildSnapshot(raw) {
  const { tag, release, tree, skillFiles, sourcesLock } = raw;
  if (release.tag_name !== tag) {
    throw new Error(`Release tag ${release.tag_name} does not match ${tag}`);
  }

  const prefix = `${SKILLS_ROOT}/`;
  const skillNames = new Set(
    tree
      .filter((e) => e.type === "tree" && e.path.startsWith(prefix))
      .map((e) => e.path.slice(prefix.length))
      .filter((rel) => !rel.includes("/")),
  );
  if (skillNames.size === 0)
    throw new Error(`No skills found under ${SKILLS_ROOT}`);

  const assetsByName = new Map(
    release.assets.map((a) => [
      a.name,
      {
        name: a.name,
        size: a.size,
        url: a.browser_download_url,
        digest: a.digest,
      },
    ]),
  );

  const sources = (sourcesLock.sources ?? [])
    .map((s) => ({
      name: String(s.name),
      url: String(s.url),
      sha: typeof s.sha === "string" ? s.sha : null,
      license: String(s.license),
      copyright: String(s.copyright),
      skills: Array.isArray(s.skills)
        ? [...s.skills].map(String).sort(byString)
        : [],
      note: typeof s.note === "string" ? s.note : null,
    }))
    .sort((a, b) => byString(a.name, b.name));

  const sourceForSkill = new Map();
  for (const source of sources) {
    for (const skill of source.skills) {
      if (!skillNames.has(skill)) {
        throw new Error(
          `sources.lock.json lists ${skill} under ${source.name}, but the repo has no such skill`,
        );
      }
      if (sourceForSkill.has(skill)) {
        throw new Error(
          `${skill} is listed under two sources in sources.lock.json`,
        );
      }
      sourceForSkill.set(skill, source.name);
    }
  }

  const patchesBySkill = new Map();
  for (const entry of tree) {
    if (entry.type !== "blob" || !/^patches\/[^/]+\.patch$/.test(entry.path))
      continue;
    const skill = skillForPatch(entry.path, skillNames, sourcesLock.copied);
    if (!skill) continue;
    patchesBySkill.set(skill, [
      ...(patchesBySkill.get(skill) ?? []),
      entry.path,
    ]);
  }

  const skills = [...skillNames].sort(byString).map((name) => {
    const text = skillFiles[name];
    if (typeof text !== "string")
      throw new Error(`Missing SKILL.md for ${name}`);
    const content = text.replace(/\r\n?/g, "\n");
    const { data } = parseFrontmatter(content);
    if (data.name !== name) {
      throw new Error(
        `SKILL.md name "${data.name}" does not match folder ${name}`,
      );
    }
    if (
      typeof data.description !== "string" ||
      data.description.trim() === ""
    ) {
      throw new Error(`SKILL.md for ${name} has no description`);
    }

    const sourceName = sourceForSkill.get(name) ?? null;
    const copiedEntry = sourcesLock.copied?.[`skills/${name}/SKILL.md`];
    const credits =
      data.metadata && typeof data.metadata === "object"
        ? data.metadata.credits
        : null;
    // Sources that credit an excerpt (no `skills` list) attach to the skill
    // whose frontmatter `metadata.credits.url` points into that repo.
    const excerptSources =
      credits && typeof credits.url === "string"
        ? sources
            .filter(
              (s) =>
                s.skills.length === 0 && credits.url.startsWith(`${s.url}/`),
            )
            .map((s) => s.name)
        : [];

    const files = tree
      .filter(
        (e) => e.type === "blob" && e.path.startsWith(`${prefix}${name}/`),
      )
      .map((e) => ({
        path: e.path.slice(`${prefix}${name}/`.length),
        size: e.size ?? 0,
      }))
      .sort((a, b) => byString(a.path, b.path));
    if (!files.some((f) => f.path === "SKILL.md")) {
      throw new Error(`Tree has no SKILL.md for ${name}`);
    }

    return {
      name,
      description: data.description.trim(),
      license: typeof data.license === "string" ? data.license : null,
      userInvoked: data["disable-model-invocation"] === true,
      source: sourceName,
      upstreamPath: sourceName && copiedEntry ? copiedEntry.source_path : null,
      excerptSources,
      credits:
        credits && typeof credits === "object"
          ? {
              skill: typeof credits.skill === "string" ? credits.skill : null,
              author:
                typeof credits.author === "string" ? credits.author : null,
              organisation:
                typeof credits.organisation === "string"
                  ? credits.organisation
                  : null,
              url: typeof credits.url === "string" ? credits.url : null,
            }
          : null,
      patches: [...(patchesBySkill.get(name) ?? [])].sort(byString),
      files,
      zip: assetFor(assetsByName, `${name}.zip`, name),
      flatZip: assetFor(assetsByName, `${name}-flat.zip`, name),
      content,
    };
  });

  return {
    $comment:
      "Generated by scripts/sync-skills.mjs. Do not edit; run `pnpm skills:sync`.",
    repo: REPO,
    repoUrl: REPO_URL,
    tag,
    version: String(sourcesLock.version),
    releaseUrl: release.html_url,
    publishedAt: release.published_at,
    skillsRoot: SKILLS_ROOT,
    pluginZip: assetFor(assetsByName, PLUGIN_ZIP, null),
    sources,
    skills,
  };
}

/** Deterministic serialisation: 2-space JSON plus a trailing newline. */
export function serializeSnapshot(snapshot) {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

/* ─── GitHub I/O (only used when run as a script) ──────────────────────────── */

async function getJson(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kunanonj-skills-sync",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(
      `GET ${url} -> ${res.status} ${res.statusText}${token ? "" : " (set GITHUB_TOKEN to raise the rate limit)"}`,
    );
  }
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "kunanonj-skills-sync" },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

export async function fetchRaw(tag) {
  const api = `https://api.github.com/repos/${REPO}`;
  const raw = (p) =>
    `https://raw.githubusercontent.com/${REPO}/${encodeURIComponent(tag)}/${p}`;

  const [release, treeRes, lockText] = await Promise.all([
    getJson(`${api}/releases/tags/${encodeURIComponent(tag)}`),
    getJson(`${api}/git/trees/${encodeURIComponent(tag)}?recursive=1`),
    getText(raw("sources.lock.json")),
  ]);
  if (treeRes.truncated) throw new Error("Git tree response was truncated");
  const tree = treeRes.tree.map((e) => ({
    path: e.path,
    type: e.type,
    size: e.size,
  }));

  const prefix = `${SKILLS_ROOT}/`;
  const names = tree
    .filter((e) => e.type === "tree" && e.path.startsWith(prefix))
    .map((e) => e.path.slice(prefix.length))
    .filter((rel) => !rel.includes("/"));
  const skillFiles = Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [
        name,
        await getText(raw(`${prefix}${name}/SKILL.md`)),
      ]),
    ),
  );

  return {
    tag,
    release: {
      tag_name: release.tag_name,
      html_url: release.html_url,
      published_at: release.published_at,
      assets: release.assets.map((a) => ({
        name: a.name,
        size: a.size,
        digest: a.digest,
        browser_download_url: a.browser_download_url,
      })),
    },
    tree,
    skillFiles,
    sourcesLock: JSON.parse(lockText),
  };
}

function parseArgs(argv) {
  const args = { tag: DEFAULT_TAG, check: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--tag") args.tag = argv[++i];
    else if (argv[i].startsWith("--tag=")) args.tag = argv[i].slice(6);
    else if (argv[i] === "--check") args.check = true;
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  if (!args.tag) throw new Error("--tag needs a value, e.g. --tag v6.1.1");
  return args;
}

async function main() {
  const { tag, check } = parseArgs(process.argv.slice(2));
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const outFile = path.join(root, OUTPUT_PATH);

  const snapshot = buildSnapshot(await fetchRaw(tag));
  const next = serializeSnapshot(snapshot);
  const current = fs.existsSync(outFile)
    ? fs.readFileSync(outFile, "utf8")
    : "";

  if (check) {
    if (current !== next) {
      console.error(
        `[skills] ${OUTPUT_PATH} is out of date for ${tag}. Run pnpm skills:sync.`,
      );
      process.exit(1);
    }
    console.log(
      `[skills] ${OUTPUT_PATH} matches ${REPO}@${tag} (${snapshot.skills.length} skills).`,
    );
    return;
  }

  if (current === next) {
    console.log(
      `[skills] No changes: ${snapshot.skills.length} skills at ${REPO}@${tag}.`,
    );
    return;
  }
  fs.writeFileSync(outFile, next);
  console.log(
    `[skills] Wrote ${OUTPUT_PATH}: ${snapshot.skills.length} skills at ${REPO}@${tag}.`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(`[skills] ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  });
}
