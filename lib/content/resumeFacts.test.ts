import { describe, expect, it } from "vitest";
import { aboutPage } from "@/lib/content/aboutPage";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { CURRENT_ROLE, PERSON_SUMMARY } from "@/lib/content/identity";
import { RESUME_TIMELINE_FALLBACK } from "@/lib/content/resumeTimeline.fallback";
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

describe("the current role", () => {
  const current = section("Currently");

  it("is the only entry under Currently", () => {
    expect(current).toHaveLength(1);
  });

  it("reads its title, employer and start month from one constant", () => {
    expect(current[0]!.title).toBe(CURRENT_ROLE.title);
    expect(employer(current[0]!.org)).toBe(CURRENT_ROLE.organization);
    expect(current[0]!.period).toBe(`${CURRENT_ROLE.sinceShort} — Present`);
  });

  it("starts in the same month in the summary and on the FDE hub, in both languages", () => {
    const since = `${CURRENT_ROLE.title} at ${CURRENT_ROLE.organization} since ${CURRENT_ROLE.since}`;
    expect(PERSON_SUMMARY).toContain(since);
    const hub = getTopicPillar("forward-deployed-ai-engineering", "en")!;
    expect(hub.proof).toContain(since);
    const thaiHub = getTopicPillar("forward-deployed-ai-engineering", "th")!;
    expect(thaiHub.proof).toContain(
      `${CURRENT_ROLE.title} ที่ ${CURRENT_ROLE.organization} ตั้งแต่${CURRENT_ROLE.sinceThai}`,
    );
  });

  it("uses the same month in its long, short and Thai forms", () => {
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
    const [month, year] = CURRENT_ROLE.since.split(" ");
    expect(CURRENT_ROLE.sinceShort).toBe(`${month!.slice(0, 3)} ${year}`);
    expect(CURRENT_ROLE.sinceThai).toBe(`${THAI_MONTHS[month!]} ${year}`);
  });

  it("is dated nowhere else in the topic hubs, in either language", () => {
    // A start date typed by hand in a hub is how the two languages drifted.
    const months =
      /(January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d|(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม) 20\d\d/g;
    for (const locale of ["en", "th"] as const)
      for (const pillar of getAllTopicPillars(locale)) {
        const dated = JSON.stringify(pillar).match(months) ?? [];
        for (const date of dated)
          expect(
            [CURRENT_ROLE.since, CURRENT_ROLE.sinceThai],
            `${locale} ${pillar.slug}`,
          ).toContain(date);
      }
  });
});

describe("employers", () => {
  const roles = [...section("Currently"), ...section("Experience")];

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

  it("dates every role as Mon YYYY to Mon YYYY, or to Present", () => {
    // The overlap rule below reads these, so a new format must fail here
    // rather than pass there unnoticed.
    for (const item of roles) {
      const [start, end, ...rest] = item.period.split(" — ");
      expect(rest, item.title).toEqual([]);
      month(start);
      if (end !== "Present") month(end);
    }
    expect(roles.filter((item) => item.period.endsWith("Present"))).toEqual([
      roles[0],
    ]);
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

describe("independent projects", () => {
  it("lists the three, live ones first, none of them as an employed role", () => {
    const projects = section("Independent projects");
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
