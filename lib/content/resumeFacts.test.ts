import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { LATEST_ROLE, PERSON_SUMMARY } from "@/lib/content/identity";
import {
  RESUME_SKILLS_FALLBACK,
  RESUME_TIMELINE_FALLBACK,
} from "@/lib/content/resumeTimeline.fallback";
import {
  getAllTopicPillars,
  getTopicPillar,
} from "@/lib/content/topics/pillars";

/*
 * Career facts must agree on every surface (recruiter-fit phase 1). The site
 * once gave a start month, two employer names and a second full-time job
 * that the owner's CV does not. These tests keep the résumé, the identity
 * summary, the FDE hub, About and the FAQ on one set of facts.
 */

const section = (title: string) =>
  RESUME_TIMELINE_FALLBACK.find((s) => s.title === title)!.items;
const employer = (org: string) => org.split(" · ")[0]!;

describe("what he does now", () => {
  it("is his two ventures under Currently, not an employed role (owner direction 20-11-26)", () => {
    const current = section("Currently");
    expect(current.map((item) => item.title)).toEqual(["GoGoCash", "Manut AI"]);
    for (const item of current) {
      expect(item.org).toMatch(/· Independent project$/);
      expect(item.period).toMatch(/ — Present$/);
    }
  });
});

describe("the latest role", () => {
  const latest = section("Experience")[0]!;

  it("leads Experience, with its title, employer and both months from one constant", () => {
    expect(latest.title).toBe(LATEST_ROLE.title);
    expect(employer(latest.org)).toBe(LATEST_ROLE.organization);
    expect(latest.period).toBe(
      `${LATEST_ROLE.sinceShort} — ${LATEST_ROLE.untilShort}`,
    );
  });

  it("is in the past tense, with the same months, in the summary and on the FDE hub, in both languages", () => {
    const held = `${LATEST_ROLE.title} at ${LATEST_ROLE.organization} from ${LATEST_ROLE.since} to ${LATEST_ROLE.until}`;
    expect(PERSON_SUMMARY).toContain(`He was ${held}`);
    const hub = getTopicPillar("forward-deployed-ai-engineering", "en")!;
    expect(hub.proof).toContain(held);
    const thaiHub = getTopicPillar("forward-deployed-ai-engineering", "th")!;
    expect(thaiHub.proof).toContain(
      `${LATEST_ROLE.title} ที่ ${LATEST_ROLE.organization} ตั้งแต่${LATEST_ROLE.sinceThai} ถึง${LATEST_ROLE.untilThai}`,
    );
  });

  it("is never presented as current", () => {
    const spoken = JSON.stringify([
      PERSON_SUMMARY,
      aboutPage,
      FAQ_ITEMS,
      getAllTopicPillars("en"),
      getAllTopicPillars("th"),
    ]);
    expect(spoken).not.toMatch(
      /\b(leads|lead|leading) (IT|AI|internal)|since September 2025|where he leads|AI engineering lead and solopreneur|AI Engineering Lead at The Binary Holdings, founder/i,
    );
  });

  it("uses the same months in their long, short and Thai forms", () => {
    const THAI_MONTHS: Record<string, string> = {
      January: "มกราคม",
      February: "กุมภาพันธ์",
      March: "มีนาคม",
      April: "เมษายน",
      May: "พฤษภาคม",
      June: "มิถุนายน",
      July: "กรกฎาคม",
      August: "สิงหาคม",
      September: "กันยายน",
      October: "ตุลาคม",
      November: "พฤศจิกายน",
      December: "ธันวาคม",
    };
    for (const [long, short, thai] of [
      [LATEST_ROLE.since, LATEST_ROLE.sinceShort, LATEST_ROLE.sinceThai],
      [LATEST_ROLE.until, LATEST_ROLE.untilShort, LATEST_ROLE.untilThai],
    ]) {
      const [month, year] = long.split(" ");
      expect(short).toBe(`${month!.slice(0, 3)} ${year}`);
      expect(thai).toBe(`${THAI_MONTHS[month!]} ${year}`);
    }
  });

  it("is dated nowhere else in the topic hubs, in either language", () => {
    // A date typed by hand in a hub is how the two languages drifted.
    const months =
      /(January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d|(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม) 20\d\d/g;
    for (const locale of ["en", "th"] as const)
      for (const pillar of getAllTopicPillars(locale)) {
        const dated = JSON.stringify(pillar).match(months) ?? [];
        for (const date of dated)
          expect(
            [
              LATEST_ROLE.since,
              LATEST_ROLE.sinceThai,
              LATEST_ROLE.until,
              LATEST_ROLE.untilThai,
            ],
            `${locale} ${pillar.slug}`,
          ).toContain(date);
      }
  });
});

describe("employers", () => {
  const roles = section("Experience");

  it("are the CV's, newest first, with no second job beside Playbux", () => {
    expect(roles.map((item) => [employer(item.org), item.title])).toEqual([
      ["The Binary Holdings", "IT Manager & AI Engineering Lead"],
      ["Aiden Labs", "AI Project Manager"],
      ["Aiden Labs", "Advisor"],
      ["The Binary Holdings", "Technical Project Manager"],
      ["Playbux", "Project Manager"],
      ["Coins.co.th", "IT Project Manager"],
      ["The Monk Games - Bitkub Metaverse", "Business Development Executive"],
      ["KK Venture Global", "Business System Analyst"],
      ["KK Venture Global", "Blockchain Developer"],
      ["Bitkub", "Smart Contract Intern"],
    ]);
  });

  it("carry the CV's start and end months", () => {
    // The periods were checked against the CV on 10-11-26; the titles are
    // the site's wording (the CV writes the latest one with a slash). The
    // latest role's end month is the owner's direction of 20-11-26. These
    // periods reach the résumé, Home, /llms-full.txt and the PDF, so a
    // changed month has to be a decision made here, not a slip in the data.
    expect(roles.map((item) => [item.title, item.period])).toEqual([
      ["IT Manager & AI Engineering Lead", "Sep 2025 — Nov 2026"],
      ["AI Project Manager", "Jan 2025 — Oct 2025"],
      ["Advisor", "Nov 2024 — Dec 2024"],
      ["Technical Project Manager", "Sep 2024 — Dec 2024"],
      ["Project Manager", "Nov 2023 — Sep 2024"],
      ["IT Project Manager", "Apr 2023 — Oct 2023"],
      ["Business Development Executive", "Feb 2023 — Apr 2023"],
      ["Business System Analyst", "Mar 2022 — Feb 2023"],
      ["Blockchain Developer", "Feb 2022 — Apr 2022"],
      ["Smart Contract Intern", "Nov 2021 — Jan 2022"],
    ]);
  });

  it("names VaporFund only as a launch inside the Playbux role", () => {
    const mentions = RESUME_TIMELINE_FALLBACK.flatMap((s) => s.items).filter(
      (item) => JSON.stringify(item).includes("VaporFund"),
    );
    expect(mentions.map((item) => employer(item.org))).toEqual(["Playbux"]);
  });

  /** "Sep 2025" as a month count; fails the test if the text is not a month. */
  const month = (text: string | undefined) => {
    expect(text, "a period part").toMatch(/^[A-Z][a-z]{2} \d{4}$/);
    const date = new Date(`1 ${text}`);
    expect(Number.isNaN(date.getTime()), `"${text}" is a date`).toBe(false);
    return date.getFullYear() * 12 + date.getMonth();
  };

  it("dates every role as Mon YYYY to Mon YYYY, none of them to Present", () => {
    // The overlap rule below reads these, so a new format must fail here
    // rather than pass there unnoticed.
    for (const item of roles) {
      const [start, end, ...rest] = item.period.split(" — ");
      expect(rest, item.title).toEqual([]);
      month(start);
      if (end !== "Present") month(end);
    }
    // No employed role is current since 20-11-26.
    expect(roles.filter((item) => item.period.endsWith("Present"))).toEqual([]);
  });

  it("explains every role that overlaps the one listed above it", () => {
    let overlapping = 0;
    roles.forEach((item, i) => {
      const previous = roles[i - 1];
      if (!previous) return;
      const [start] = previous.period.split(" — ");
      const end = item.period.split(" — ")[1];
      // The role above started before the month this one ended: the two
      // overlap. A change of title inside one employer does not count, nor
      // does leaving one job and starting the next in the same month.
      const overlaps =
        month(start) < month(end) &&
        employer(item.org) !== employer(previous.org);
      if (!overlaps) return;
      overlapping += 1;
      expect(
        item.note ?? previous.note ?? "",
        `${item.title} and ${previous.title}`,
      ).toMatch(/concurrent/i);
    });
    // The CV has two such pairs (Aiden Labs beside The Binary Holdings,
    // twice). If the rule stops finding them, it has stopped working.
    expect(overlapping).toBe(2);
  });

  it("are the ones About and the FAQ name", () => {
    const known = RESUME_TIMELINE_FALLBACK.flatMap((s) => s.items).flatMap(
      (item) => [employer(item.org), item.title],
    );
    for (const chip of aboutPage.path.chips)
      for (const label of chip.label.split(" / "))
        expect(
          known.some((name) => name.startsWith(label)),
          `About arc: ${label}`,
        ).toBe(true);

    const prose = [
      JSON.stringify(aboutPage.story),
      ...FAQ_ITEMS.map((faq) => faq.answer),
    ].join(" ");
    expect(prose).toContain("KK Venture Global");
    expect(prose).not.toMatch(/\bFICO\b/);
  });
});

/** Every source and content file under a folder (code, JSON, Markdown), tests left out. */
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(tsx?|json|mdx?)$/.test(name) && !/\.test\.tsx?$/.test(name)
      ? [path]
      : [];
  });
}

describe("the wording rule", () => {
  it('says "RAG" only where the owner cleared it', () => {
    // The owner's answers of 11-11-26: the résumé lists RAG under AI & Cloud
    // as the CV does, and the knowledge platform of the CV's bullet is ARIA.
    // The word appears for those two and nowhere else (umbrella plan, hard
    // constraints).
    const said = RESUME_TIMELINE_FALLBACK.flatMap((s) => s.items).flatMap(
      (item) => (item.bullets ?? []).filter((bullet) => /\bRAG\b/.test(bullet)),
    );
    expect(said).toHaveLength(1);
    expect(said[0]).toMatch(/knowledge platform/);
    expect(section("Experience")[0]!.bullets).toContain(said[0]);
    expect(
      RESUME_SKILLS_FALLBACK.filter((group) =>
        group.items.some((item) => /\bRAG\b/.test(item)),
      ).map((group) => group.label),
    ).toEqual(["AI & Cloud"]);

    // And in no other file the site is built from, comments included: a
    // note about the rule belongs in the résumé data file.
    const files = ["lib", "components", "src", "public", "sanity"]
      .flatMap(sources)
      .filter((file) => /\bRAG\b/.test(readFileSync(file, "utf8")));
    expect(files, 'only the résumé data may say "RAG"').toEqual([
      "lib/content/resumeTimeline.fallback.ts",
    ]);
  });
});

describe("independent projects", () => {
  it("lists the three once each, the live two under Currently, none of them as an employed role", () => {
    const projects = [
      ...section("Currently"),
      ...section("Independent projects"),
    ];
    expect(projects.map((item) => item.title)).toEqual([
      "GoGoCash",
      "Manut AI",
      "GoSpark",
    ]);
    for (const item of projects)
      expect(item.org).toMatch(/· Independent project$/);
    expect(projects[2]!.period).toBe("In development");
  });
});
