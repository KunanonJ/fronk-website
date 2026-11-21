import snapshot from "@/lib/content/openSource.generated.json";
import type { PixelTone } from "@/lib/landing/journey";
import { formatDay } from "@/lib/utils/relativeDay";

/*
 * The owner's open-source projects (owner request 21-11-26: Superstacks,
 * thai-accounting-tax-law and OpenFinance, and no other repository), for
 * /open-source, its Markdown twin, the agent docs and Home's strip.
 *
 * Facts (license, release, last commit, stars) come from the committed
 * GitHub snapshot, lib/content/openSource.generated.json, which
 * `pnpm oss:sync` writes; nothing here calls GitHub. The words are the
 * owner's own, from the GitHub profile README and each repository's README
 * and description, lightly trimmed; labels the owner has not published are
 * marked `// DRAFT`. Install commands are copied from each README, never
 * written here. Stars show only from STARS_SHOWN_FROM.
 *
 * Kept light, since Home imports it: it imports neither lib/content/skills
 * nor SkillParts, whose snapshot carries every SKILL.md (openSource.test.ts
 * checks).
 */

type ProjectFacts = (typeof snapshot.projects)[number];

interface InstallStep {
  label: string;
  /** As the README gives it; several commands keep one per line. */
  command: string;
  copyLabel: string;
  announcement: string;
  /**
   * Where it is typed, which names the Markdown twin's fence: `text` for a
   * Claude Code slash command, `sh` for a terminal.
   */
  fence: "text" | "sh";
}

interface Overlay {
  /** The card's anchor on /open-source, e.g. `/open-source#superstacks`. */
  slug: string;
  name: string;
  /** Two letters from the pixel alphabet (PIXEL_LETTERS). */
  badge: string;
  tone: PixelTone;
  /** The card's kicker. */
  kind: string;
  tagline: string;
  summary: string;
  /** Curated chips (GitHub's language is not always the stack). */
  stack: readonly string[];
  /** The card takes the whole row. */
  wide?: boolean;
  /** The install, step by step, as the README gives it. */
  install?: readonly InstallStep[];
  more?: {
    label: string;
    href: string;
    external: boolean;
    lang?: "th";
    /** Read by screen readers after the label. */
    note?: string;
    /** The link's label in the Markdown twin. */
    mdLabel: string;
  };
}

export type OpenSourceProject = Overlay & { facts: ProjectFacts };

const OVERLAY: Record<string, Overlay> = {
  "KunanonJ/superstacks": {
    slug: "superstacks",
    name: "Superstacks",
    badge: "SS",
    tone: "violet",
    // The nav's label for /skills.
    kind: "Agent skills",
    // The repository description, its first clause.
    tagline: "Lean MIT skill stack for coding agents.",
    // The profile README's line, without its skill count.
    summary:
      "MIT skill stack for Claude Code, Cursor, and Codex: plans, TDD, verify-loop, constraints, review, PRs, and ticket pipelines.",
    // The profile README's "for Claude Code, Cursor, and Codex", and GitHub's language.
    stack: ["Claude Code", "Cursor", "Codex", "Python"],
    wide: true,
    // The README's Quick start for Claude Code, its two steps (the
    // marketplace adds nothing until the plugin is installed), with /skills'
    // labels and announcements for the same steps (SkillsIndexPage).
    // openSource.test.ts checks the commands against PACK_INSTALL.
    install: [
      {
        label: "1. Add the marketplace (type it in Claude Code)",
        command: "/plugin marketplace add KunanonJ/superstacks",
        copyLabel: "Copy the Superstacks marketplace command", // DRAFT
        announcement: "Copied the marketplace command",
        fence: "text",
      },
      {
        label: "2. Install the plugin",
        command: "/plugin install superstacks@superstacks",
        copyLabel: "Copy the Superstacks plugin install command", // DRAFT
        announcement: "Copied the plugin install command",
        fence: "text",
      },
    ],
    more: {
      label: "Browse the skills", // DRAFT
      href: "/skills",
      external: false,
      mdLabel: "On this site", // DRAFT
    },
  },
  "KunanonJ/thai-accounting-tax-law": {
    slug: "thai-accounting-tax-law",
    // The README's h1, without its flag.
    name: "Thai Accounting, Tax & Business Law",
    badge: "TH",
    tone: "coral",
    // Trimmed from the description's "Open handbook + AI agent skill".
    kind: "Handbook + AI skill", // DRAFT
    // The README's bold line, without its emoji.
    tagline:
      "Thai SME taxes, explained without the headache. Every number has receipts.",
    // The profile README's line, without its list of topics.
    summary:
      "Handbook and agent skill for Thai SME accounting, tax, and business law, in English and Thai, with a source on every rule.",
    // The description's "(CIT, WHT, VAT)" and the profile README's "in English and Thai".
    stack: ["CIT", "WHT", "VAT", "English and Thai"],
    install: [
      {
        label: "Add the skill to Claude Code", // DRAFT
        // The README's "Claude Code" block, word for word, one step per line.
        command: [
          "git clone https://github.com/KunanonJ/thai-accounting-tax-law.git",
          "mkdir -p ~/.claude/skills",
          "cp -r thai-accounting-tax-law/skills/thai-accounting-tax-law ~/.claude/skills/",
        ].join("\n"),
        copyLabel:
          "Copy the commands that add the Thai tax skill to Claude Code", // DRAFT
        announcement: "Copied the Claude Code commands", // DRAFT
        fence: "sh",
      },
    ],
    more: {
      // The README's own link to its Thai version.
      label: "ภาษาไทย",
      href: "https://github.com/KunanonJ/thai-accounting-tax-law/blob/main/README.th.md",
      external: true,
      lang: "th",
      note: "the README in Thai", // DRAFT
      mdLabel: "README in Thai", // DRAFT
    },
  },
  "KunanonJ/OpenFinance": {
    slug: "openfinance",
    name: "OpenFinance",
    badge: "OF",
    tone: "ink",
    kind: "Finance app", // DRAFT
    // The README's first sentence, trimmed.
    tagline: "Local-first finance and subscription tracker.",
    // The profile README's line, without its stack.
    summary:
      "Privacy-minded personal finance workspace for subscriptions, budgets, cash flow, and spending visualizations.",
    // The profile README's line, its stack.
    stack: ["React", "Vite", "Cloudflare", "Google Sheets"],
    // No link to the running app: the repository's homepage on GitHub
    // (chameleon-finance-c4y.pages.dev, which its README calls Production)
    // did not resolve on 21-11-26. Link one only once the owner gives an
    // address that loads; the card ends with its GitHub link until then.
  },
};

/** The projects in the owner's order (the snapshot's), each with its facts. */
export const OPEN_SOURCE_PROJECTS: readonly OpenSourceProject[] =
  snapshot.projects.map((facts) => {
    const overlay = OVERLAY[facts.repo];
    if (!overlay)
      throw new Error(`${facts.repo} has no copy in lib/content/openSource.ts`);
    return { ...overlay, facts };
  });

/** The UTC day the snapshot's facts were read, e.g. `2026-11-21`. */
export const OPEN_SOURCE_SYNCED_ON = snapshot.syncedOn;

/** Stars show from this count; below it a count reads as a verdict, not a fact. */
export const STARS_SHOWN_FROM = 25;

/** The stars a card shows, or null below STARS_SHOWN_FROM. */
export function shownStars(stars: number): number | null {
  return stars >= STARS_SHOWN_FROM ? stars : null;
}

const LICENSES = [...new Set(OPEN_SOURCE_PROJECTS.map((p) => p.facts.license))];

/** /open-source's hero and card labels. */
export const openSourcePage = {
  eyebrow: "Open source", // DRAFT
  headline: {
    lines: [
      [{ muted: "Built" }, " in the open,"], // DRAFT
      [{ muted: "free under MIT." }], // DRAFT
    ],
    // The Thai handbook README's license line ("Use it, fork it, ship it in your product."), trimmed.
    accent: "Use it, fork it, ship it.",
  },
  lead: "The skill stack I build with, an open handbook for Thai SME tax and business law, and a personal finance workspace. Source, releases and install steps are on GitHub.", // DRAFT
  // The /skills hero's pill label.
  github: {
    label: "View on GitHub",
    href: "https://github.com/KunanonJ",
    handle: "KunanonJ",
  },
  meta: `${OPEN_SOURCE_PROJECTS.length} projects · ${LICENSES.length === 1 ? `${LICENSES[0]} license` : "open-source licenses"} · GitHub numbers as of ${formatDay(OPEN_SOURCE_SYNCED_ON)}`, // DRAFT
  labels: {
    projects: "Projects", // DRAFT
    release: "Latest release", // DRAFT
    updated: "Updated", // DRAFT
    stars: "Stars", // DRAFT
    stack: "Stack", // DRAFT
  },
} as const;

/** Home's strip (OpenSourceStrip.tsx), after the Journey's story. */
export const openSourceStrip = {
  eyebrow: "Open source", // DRAFT
  heading: "Built in the open.", // DRAFT
  lead: "The agent skills I build with, a Thai SME tax handbook and a personal finance app. All MIT, all on GitHub.", // DRAFT
  cta: "All open source", // DRAFT
  updated: "updated", // DRAFT
  // The title of each "updated" once it reads "5 days ago": the words count
  // from the visitor's clock, the date from the snapshot, so it says when
  // GitHub was read.
  asOf: `GitHub as of ${formatDay(OPEN_SOURCE_SYNCED_ON)}`, // DRAFT
} as const;
