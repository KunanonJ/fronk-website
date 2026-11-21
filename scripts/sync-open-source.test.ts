import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  OUTPUT_PATH,
  REPOS,
  buildSnapshot,
  describeChanges,
  factsOf,
  projectFacts,
  serializeSnapshot,
} from "./sync-open-source.mjs";

/*
 * The open-source snapshot (21-11-26): GitHub's answers for the owner's three
 * repositories become the committed facts /open-source and the Home strip
 * are built from. The fixtures keep the fields of the real answers (read
 * with `gh api` on 21-11-26) that the script reads, plus a field it ignores.
 */

type Raw = Parameters<typeof projectFacts>[0];

function repo(name: string, extra: Record<string, unknown> = {}) {
  return {
    full_name: name,
    html_url: `https://github.com/${name}`,
    homepage: "",
    private: false,
    fork: false,
    archived: false,
    license: { key: "mit", spdx_id: "MIT", name: "MIT License" },
    language: "Python",
    stargazers_count: 5,
    forks_count: 1,
    default_branch: "main",
    // GitHub moves this for a push to any branch; the script never reads it.
    pushed_at: "2026-11-20T10:00:00Z",
    ...extra,
  };
}

function release(tag: string, name = tag) {
  return {
    tag_name: tag,
    name,
    published_at: "2026-11-16T21:38:16Z",
    html_url: `https://github.com/x/releases/tag/${tag}`,
    draft: false,
  };
}

function head(date: string) {
  return { sha: "19770a4", commit: { committer: { date } } };
}

/** One raw answer per repository, in REPOS order. */
function raws(): Raw[] {
  return [
    {
      repo: repo("KunanonJ/superstacks", {
        homepage: "https://kunanonj.com/skills",
      }),
      release: release("v6.7.0"),
      head: head("2026-11-16T21:37:52Z"),
    },
    {
      repo: repo("KunanonJ/thai-accounting-tax-law", {
        language: null,
        stargazers_count: 0,
        forks_count: 0,
      }),
      release: release(
        "v1.0.0",
        "v1.0.0: Thai accounting, tax & business law handbook + AI skill",
      ),
      head: head("2026-11-15T14:00:00Z"),
    },
    {
      repo: repo("KunanonJ/OpenFinance", {
        homepage: "https://chameleon-finance-c4y.pages.dev/",
        language: "JavaScript",
        stargazers_count: 6,
        forks_count: 3,
      }),
      release: release("v2026.06.17-openfinance", "OpenFinance 2026.06.17"),
      head: head("2026-06-17T01:48:03Z"),
    },
  ];
}

describe("projectFacts", () => {
  it("keeps the facts the page shows, in a fixed key order", () => {
    const [first] = raws();
    expect(projectFacts(first!)).toEqual({
      repo: "KunanonJ/superstacks",
      url: "https://github.com/KunanonJ/superstacks",
      homepage: "https://kunanonj.com/skills",
      license: "MIT",
      language: "Python",
      stars: 5,
      forks: 1,
      defaultBranch: "main",
      // The newest commit on the default branch, not pushed_at.
      lastCommitAt: "2026-11-16T21:37:52Z",
      release: {
        tag: "v6.7.0",
        name: "v6.7.0",
        publishedAt: "2026-11-16T21:38:16Z",
        url: "https://github.com/x/releases/tag/v6.7.0",
      },
    });
    expect(Object.keys(projectFacts(first!))).toEqual([
      "repo",
      "url",
      "homepage",
      "license",
      "language",
      "stars",
      "forks",
      "defaultBranch",
      "lastCommitAt",
      "release",
    ]);
  });

  it("reads an empty homepage and a missing language as null", () => {
    const facts = projectFacts(raws()[1]!);
    expect(facts.homepage).toBeNull();
    expect(facts.language).toBeNull();
  });

  it("gives release null to a repository with no release", () => {
    expect(projectFacts({ ...raws()[0]!, release: null }).release).toBeNull();
  });

  it.each([
    ["private", { private: true }, /is private/],
    ["a fork", { fork: true }, /is a fork/],
    ["archived", { archived: true }, /is archived/],
    ["unlicensed", { license: null }, /no license/],
    [
      "under a license GitHub cannot name",
      { license: { key: "other", spdx_id: "NOASSERTION" } },
      /no license/,
    ],
  ])("refuses a repository that is %s", (_, extra, error) => {
    const raw = raws()[0]!;
    expect(() =>
      projectFacts({ ...raw, repo: { ...raw.repo, ...extra } }),
    ).toThrow(error);
  });

  it("refuses a repository with no commit on its default branch", () => {
    expect(() => projectFacts({ ...raws()[0]!, head: null })).toThrow(
      /no commit on main/,
    );
  });
});

describe("buildSnapshot", () => {
  it("keeps REPOS order whatever order GitHub answers in", () => {
    const snapshot = buildSnapshot([...raws()].reverse(), "2026-11-21");
    expect(snapshot.projects.map((p) => p.repo)).toEqual(REPOS);
    expect(snapshot.syncedOn).toBe("2026-11-21");
    expect(snapshot.$comment).toMatch(/pnpm oss:sync/);
  });

  it("fails loudly when a repository is missing from the answers", () => {
    expect(() => buildSnapshot(raws().slice(1), "2026-11-21")).toThrow(
      /nothing for KunanonJ\/superstacks/,
    );
  });

  it("takes syncedOn only as a UTC day", () => {
    expect(() => buildSnapshot(raws(), "21-11-26")).toThrow(/UTC day/);
  });

  it("serialises byte for byte the same, ending in a newline", () => {
    const first = serializeSnapshot(buildSnapshot(raws(), "2026-11-21"));
    const second = serializeSnapshot(
      buildSnapshot([...raws()].reverse(), "2026-11-21"),
    );
    expect(first).toBe(second);
    expect(first.endsWith("}\n")).toBe(true);
  });

  it("matches the committed snapshot's shape", () => {
    const committed = JSON.parse(
      readFileSync(join(process.cwd(), OUTPUT_PATH), "utf8"),
    ) as ReturnType<typeof buildSnapshot>;
    expect(Object.keys(committed)).toEqual([
      "$comment",
      "syncedOn",
      "projects",
    ]);
    expect(committed.projects.map((p) => p.repo)).toEqual(REPOS);
    const keys = Object.keys(projectFacts(raws()[0]!));
    for (const project of committed.projects) {
      expect(Object.keys(project), project.repo).toEqual(keys);
      if (project.release)
        expect(Object.keys(project.release), project.repo).toEqual([
          "tag",
          "name",
          "publishedAt",
          "url",
        ]);
    }
  });
});

describe("factsOf and describeChanges: what a re-run and --check compare", () => {
  it("sees the same facts read on another day as no change", () => {
    const monday = buildSnapshot(raws(), "2026-11-21");
    const tuesday = buildSnapshot(raws(), "2026-11-22");
    expect(factsOf(monday)).toBe(factsOf(tuesday));
    expect(describeChanges(monday, tuesday)).toEqual([]);
  });

  it("names each fact that moved", () => {
    const before = buildSnapshot(raws(), "2026-11-21");
    const bumped = raws();
    bumped[0] = {
      ...bumped[0]!,
      repo: { ...bumped[0]!.repo, stargazers_count: 6 },
    };
    const after = buildSnapshot(bumped, "2026-11-22");
    expect(factsOf(after)).not.toBe(factsOf(before));
    expect(describeChanges(before, after)).toEqual([
      "KunanonJ/superstacks stars: 5 -> 6",
    ]);
  });

  it("names a project that is new or gone", () => {
    const now = buildSnapshot(raws(), "2026-11-21");
    expect(describeChanges(null, now)).toEqual(
      REPOS.map((name) => `${name}: new`),
    );
    const old = { ...now, projects: [...now.projects, { repo: "KunanonJ/x" }] };
    expect(describeChanges(old, now)).toEqual(["KunanonJ/x: gone"]);
  });
});
