import { describe, expect, it } from "vitest";
import { getAllPortfolioProjects, outcomeLine } from "@/lib/content/portfolio";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
import {
  getAllTopicPillars,
  getTopicPillar,
} from "@/lib/content/topics/pillars";
import { siteSources } from "@/tests/siteSources";

/*
 * Clearance audit for the case-study outcomes (recruiter-fit phase 3). A
 * figure reaches a project page only when the owner's CV states it and the
 * owner has said which project it describes. This file lists what he
 * cleared on 11-11-26 (decisions 13 and 14 in the program's umbrella plan);
 * an outcome, a hub line or a "wrote code" claim that is not in these lists
 * fails here, wherever in the site's sources it is written. The test cannot
 * know what he said: it compares the site with the lists, so a new entry
 * belongs here only after he has answered. It compares wording, so a claim
 * reworded past its patterns is for a reader to catch.
 */

/**
 * The owner's mapping (11-11-26): each cleared outcome as the page prints it,
 * on the project he mapped it to, with a phrase that picks out the one résumé
 * bullet it restates. A project shows these lines and no others.
 */
const OWNER_CLEARED: Record<
  string,
  readonly { line: string; bullet: string }[]
> = {
  "tbh-intranet": [
    {
      line: "Adoption: 50+ employees",
      bullet: "achieved adoption by 50+ employees",
    },
    {
      line: "Build cycles: 4 months to 1 week",
      bullet: "fell from 4 months to 1 week",
    },
  ],
  // "Yes, that is Fando": the video pipeline the project page draws. One
  // bullet states both figures.
  "ai-automation": [
    {
      line: "Recurring workflow staffing: 10 people to 1 operator",
      bullet: "from 10 people to 1 operator",
    },
    { line: "Turnaround: 30 minutes", bullet: "with a 30-minute turnaround" },
  ],
};

/**
 * The FDE hub's proof lines for the outcomes, as drafted on 11-11-26; the
 * owner reads them before the merge. They are typed in `topics/pillars.ts`,
 * so they are pinned here word for word, in both languages: a figure
 * compared by its digits alone would let "30 นาที" (minutes) become "30
 * ชั่วโมง" (hours).
 */
const HUB_LINES: Record<string, { en: string; th: string }> = {
  "tbh-intranet": {
    en: "TBH Intranet: adoption by 50+ employees; build cycles from 4 months to 1 week",
    th: "TBH Intranet: มีพนักงานใช้งาน 50+ คน และรอบการพัฒนาลดลงจาก 4 เดือนเหลือ 1 สัปดาห์",
  },
  "ai-automation": {
    en: "AI Automation: recurring workflow staffing from 10 people to 1 operator; 30-minute turnaround",
    th: "AI Automation: ลดจำนวนคนในเวิร์กโฟลว์ที่ทำเป็นประจำจาก 10 คนเหลือผู้ปฏิบัติงาน 1 คน ด้วยระยะเวลาดำเนินการ 30 นาที",
  },
};

/** Projects the owner said he wrote code for. */
const WROTE_CODE = [
  "tbh-intranet",
  "ai-automation",
  "node-validator-automation",
  "email-signature-generator",
];

const projects = getAllPortfolioProjects();
const bullets = RESUME_TIMELINE_FALLBACK.flatMap((section) =>
  section.items.flatMap((item) => item.bullets ?? []),
);

/** Words as compared: lower case, hyphens split, a plural "s" dropped. */
const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter(Boolean)
    .map((word) => word.replace(/s$/, ""));

/** True when `part` reads through `whole` in order, other words between. */
function inOrder(part: readonly string[], whole: readonly string[]): boolean {
  let next = 0;
  for (const word of whole) if (word === part[next]) next += 1;
  return next === part.length;
}

/** True when `part` sits in `whole` as one unbroken run of words. */
function hasRun(whole: readonly string[], part: readonly string[]): boolean {
  return whole.some((_, start) =>
    part.every((word, offset) => whole[start + offset] === word),
  );
}

/** Every string inside a value, at any depth. */
const strings = (value: unknown): string[] =>
  typeof value === "string"
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : value && typeof value === "object"
        ? Object.values(value).flatMap(strings)
        : [];

/** A figure as a whole one: "30 minutes" is not in "130 minutes". */
const wholeFigure = (text: string, figure: string) =>
  new RegExp(
    `(?<!\\d)${figure.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?!\\d|[.,]\\d)`,
  ).test(text);

/**
 * A figure common enough to turn up in an unrelated sentence ("replies take
 * about 30 minutes") counts as the outcome only beside the outcome's word.
 */
const COMMON_FIGURES: Record<string, RegExp> = { "30 minutes": /turnaround/i };

/**
 * The same figures as a Thai sentence gives them, each with the word that
 * makes it the claim: "4 months" beside "week", "10 people" beside "1
 * person", "30 minutes" beside "time".
 */
const THAI_FIGURES: readonly (readonly [figure: string, beside: RegExp])[] = [
  ["50+ คน", /./],
  ["4 เดือน", /สัปดาห์/],
  ["10 คน", /(?<!\d)1 คน/],
  ["30 นาที", /เวลา/],
];

/** True when a sentence states one of the cleared outcome figures. */
function statesOutcome(text: string): boolean {
  return (
    projects
      .flatMap((project) => project.outcomes ?? [])
      .some(
        ({ value }) =>
          wholeFigure(text, value) &&
          (COMMON_FIGURES[value]?.test(text) ?? true),
      ) ||
    THAI_FIGURES.some(
      ([figure, beside]) => wholeFigure(text, figure) && beside.test(text),
    )
  );
}

describe("portfolio outcomes", () => {
  const stated = projects.flatMap((project) =>
    (project.outcomes ?? []).map((outcome) => ({ project, outcome })),
  );

  it("restates a résumé bullet word for word", () => {
    expect(stated.length).toBeGreaterThan(0);
    for (const { project, outcome } of stated)
      expect(bullets, `${project.slug}: ${outcome.label}`).toContain(
        outcome.source,
      );
  });

  it("shows exactly the lines the owner cleared, on the project he mapped them to", () => {
    for (const project of projects) {
      const cleared = OWNER_CLEARED[project.slug] ?? [];
      const outcomes = project.outcomes ?? [];
      // The label and the figure as a pair: a figure under another figure's
      // label would still be made of the bullet's words.
      expect(outcomes.map(outcomeLine), project.slug).toEqual(
        cleared.map(({ line }) => line),
      );
      outcomes.forEach((outcome, index) =>
        expect(outcome.source, outcomeLine(outcome)).toContain(
          cleared[index]!.bullet,
        ),
      );
    }
    // Each phrase must pick out one bullet, or the mapping proves nothing.
    for (const { bullet } of Object.values(OWNER_CLEARED).flat())
      expect(
        bullets.filter((text) => text.includes(bullet)),
        bullet,
      ).toHaveLength(1);
  });

  it("uses the bullet's own words, unbroken, for the label and for the figure", () => {
    for (const { project, outcome } of stated) {
      const source = words(outcome.source);
      for (const text of [outcome.label, outcome.value])
        expect(
          hasRun(source, words(text)),
          `${project.slug}: "${text}" is not a phrase of its bullet`,
        ).toBe(true);
      // Words there are: a label in another script would pass as "no words".
      expect(words(outcome.label).length, outcome.label).toBeGreaterThan(0);
      // An outcome with no figure is a description, not an outcome.
      expect(outcome.value, outcome.label).toMatch(/\d/);
    }
  });

  it("states the cleared figures in the outcomes and in no other place", () => {
    // The table of cleared surfaces is short: a project's outcomes (which
    // the pages, /proof and the text files read) and the FDE hub's pinned
    // lines. A figure typed anywhere else is a second copy nobody cleared.
    expect(Object.keys(COMMON_FIGURES)).toEqual(
      Object.keys(COMMON_FIGURES).filter((figure) =>
        stated.some(({ outcome }) => outcome.value === figure),
      ),
    );
    // No other field of any project: a summary, a highlight, a section.
    for (const project of projects)
      expect(
        strings({ ...project, outcomes: undefined }).filter(statesOutcome),
        project.slug,
      ).toEqual([]);
    // And no other file, line by line. The outcomes' own module, the résumé
    // and the hubs are covered above and below.
    const own = [
      "lib/content/portfolio.ts",
      "lib/content/resumeTimeline.fallback.ts",
      "lib/content/topics/pillars.ts",
    ];
    const elsewhere = siteSources()
      .filter(({ file }) => !own.includes(file))
      .flatMap(({ file, text }) =>
        text
          .split("\n")
          .filter(statesOutcome)
          .map((line) => `${file}: ${line.trim()}`),
      );
    expect(elsewhere).toEqual([]);
  });

  it("labels each outcome once per project", () => {
    for (const project of projects) {
      const labels = (project.outcomes ?? []).map((outcome) => outcome.label);
      expect(new Set(labels).size, project.slug).toBe(labels.length);
    }
  });
});

/*
 * The FDE hub lists the same outcomes in its proof card, in both languages.
 * The lines are typed in `topics/pillars.ts` (the hubs do not load the
 * portfolio module), so this is what keeps them on the cleared figures.
 */
describe("the FDE hub's outcome lines", () => {
  const withOutcomes = projects.filter((project) => project.outcomes?.length);
  const hubLine = (locale: "en" | "th", name: string) =>
    getTopicPillar("forward-deployed-ai-engineering", locale)!.proof.filter(
      (line) => line.startsWith(`${name}: `),
    );
  /** The figures of a text, in the order it gives them. */
  const figures = (text: string) => text.match(/\d[\d,.]*\+?/g) ?? [];

  it("are the lines drafted for the hub, word for word, in both languages", () => {
    expect(withOutcomes.length).toBeGreaterThan(0);
    for (const project of withOutcomes)
      for (const locale of ["en", "th"] as const)
        expect(hubLine(locale, project.name), project.slug).toEqual([
          HUB_LINES[project.slug]?.[locale],
        ]);
    expect(Object.keys(HUB_LINES)).toEqual(withOutcomes.map((p) => p.slug));
  });

  it("say in English only what the outcome and its bullet say", () => {
    for (const project of withOutcomes) {
      const [line] = hubLine("en", project.name);
      // Latin script only: a phrase in another script has no words to check.
      expect(line, project.slug).toMatch(/^[\x20-\x7E]+$/);
      const clauses = line!.slice(`${project.name}: `.length).split("; ");
      const outcomes = project.outcomes!;
      // One clause per outcome, in the project's order.
      expect(clauses, project.slug).toHaveLength(outcomes.length);
      clauses.forEach((clause, index) => {
        const outcome = outcomes[index]!;
        // The clause names what is measured and gives the figure, each as
        // the outcome has it, and adds nothing its bullet does not say.
        for (const text of [outcome.label, outcome.value])
          expect(
            hasRun(words(clause), words(text)),
            `"${clause}" does not give "${text}"`,
          ).toBe(true);
        expect(
          inOrder(words(clause), words(outcome.source)),
          `"${clause}" is not in its bullet`,
        ).toBe(true);
      });
    }
  });

  it("give the same figures in Thai, in the same order, in Arabic numerals", () => {
    for (const project of withOutcomes) {
      const [line] = hubLine("th", project.name);
      expect(figures(line!), project.slug).toEqual(
        project.outcomes!.flatMap((outcome) => figures(outcome.value)),
      );
      // Thai numerals would slip past the comparison above.
      expect(line, project.slug).not.toMatch(/[๐-๙]/);
    }
  });

  it("leave every other line of every hub free of the outcomes' figures", () => {
    // Any hub text, in either language: sections, FAQ, lede, description and
    // proof. Only the FDE hub's pinned lines may state an outcome. Figures
    // are compared whole, so "14 เดือน" is not "4 เดือน", and an unrelated
    // "about 30 minutes" is not the turnaround (see statesOutcome).
    const pinned = new Set(
      Object.values(HUB_LINES).flatMap(({ en, th }) => [en, th]),
    );
    for (const line of pinned) expect(statesOutcome(line), line).toBe(true);
    const hits = (["en", "th"] as const).flatMap((locale) =>
      getAllTopicPillars(locale).flatMap((pillar) =>
        strings(pillar)
          .filter((text) => !pinned.has(text))
          .filter(statesOutcome)
          .map((text) => `${pillar.slug} (${locale}): ${text}`),
      ),
    );
    expect(hits).toEqual([]);
    // And no line of any proof list pairs a project's name with a number,
    // wherever in the line the name sits.
    const named = (["en", "th"] as const).flatMap((locale) =>
      getAllTopicPillars(locale).flatMap((pillar) =>
        pillar.proof.filter(
          (line) =>
            !pinned.has(line) &&
            /\d/.test(line) &&
            projects.some((project) => line.includes(project.name)),
        ),
      ),
    );
    expect(named).toEqual([]);
  });
});

describe("portfolio 'my part'", () => {
  const parts = projects.flatMap((project) =>
    project.myPart ? [{ slug: project.slug, text: project.myPart }] : [],
  );

  it("says he wrote code only where the owner said so, in any field of a project and in no other file", () => {
    // Every string of the project, not only "My part": a highlight or a
    // section can make the same claim. The pattern reads the claim in either
    // order ("wrote the code", "code he wrote") and as "did the coding". It
    // leaves alone a step that tells someone to write code, the phrase
    // "coding agents", and "hard-coded".
    const claim =
      /\bwr(ote|itten|ites|iting)\b[^.;]{0,40}\bcod(e|ing)\b(?!\s+agents?\b)|\bcod(e|ing)\b[^.;:]{0,40}\bwr(ote|itten)\b|(?<![-\w])coded\b|\bprogrammed\b|\bdid\b[^.;]{0,40}\bcoding\b(?!\s+agents?\b)/i;
    for (const wording of [
      "Wrote code for it.",
      "Wrote the code for every page",
      "Wrote most of the code",
      "Has written the code with its unit tests",
      "Code he wrote runs every page of the site.",
      "Did the coding",
      "I did all the coding for it.",
      "Coded the agents.",
    ])
      expect(wording).toMatch(claim);
    for (const wording of [
      "Code with its unit tests",
      "Write code with its unit tests",
      "beside the code: written plans and instructions for AI coding agents",
      "written plans and instructions for AI coding agents",
      "No hard-coded secrets",
    ])
      expect(wording).not.toMatch(claim);
    const coders = projects
      .filter((project) => claim.test(JSON.stringify(project)))
      .map((project) => project.slug);
    expect(coders).toEqual(
      projects.map((p) => p.slug).filter((slug) => WROTE_CODE.includes(slug)),
    );
    // And outside the projects: the FAQ, a hub or a page could say it too.
    // The portfolio module is the one file that holds the cleared claims.
    expect(
      siteSources()
        .filter(({ text }) => claim.test(text))
        .map(({ file }) => file),
    ).toEqual(["lib/content/portfolio.ts"]);
  });

  it("keeps the owner's answers on projects that still exist", () => {
    // A renamed slug would leave an answer that clears nothing.
    const slugs = projects.map((project) => project.slug);
    for (const slug of [...Object.keys(OWNER_CLEARED), ...WROTE_CODE])
      expect(slugs).toContain(slug);
  });

  it("never claims a project as built alone", () => {
    for (const { slug, text } of parts)
      expect(text, slug).not.toMatch(
        /\bsolo\b|solo-built|single-handed|\balone\b|by myself/i,
      );
  });

  it("leaves the figures to the outcomes, which name their source", () => {
    for (const { slug, text } of parts) expect(text, slug).not.toMatch(/\d/);
  });

  it("names none of the practices the program rules out", () => {
    // Hard constraint of the program: none of these as a named practice.
    // Only these five are checked: any other wording the CV does not use
    // ("with the team", say) is for the owner to read.
    const unnamed =
      /\bevals?\b|evaluation harness|guardrails?|observability|fine-tun/i;
    for (const project of projects) {
      const text = [
        project.myPart ?? "",
        ...(project.outcomes ?? []).flatMap((o) => [o.label, o.value]),
      ].join(" ");
      expect(text, project.slug).not.toMatch(unnamed);
    }
  });
});
