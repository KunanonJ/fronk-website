import { describe, expect, it } from "vitest";
import { BLOG_PUBLIC, isBlogHref } from "@/lib/content/blogVisibility";
import {
  allCaseStudies,
  caseAccess,
  caseCopy,
  caseHeading,
  findProjectCase,
  findVentureCase,
  projectCase,
  ventureCase,
  type CaseBlock,
  type CaseStudy,
} from "@/lib/content/caseStudy";
import {
  FEATURED_PORTFOLIO_SLUGS,
  getAllPortfolioProjects,
  outcomeLine,
} from "@/lib/content/portfolio";
import {
  VENTURE_RELATED_TOPICS,
  getAllVentures,
  getVentureBySlug,
} from "@/lib/content/ventures";
import { stackCards } from "@/lib/landing/stackCards";
import parity from "@/tests/fixtures/site-parity.json";

/*
 * The case-study view model (profile redesign Phase 5, plan step 5a): every
 * field of today's content reaches the template, the h1 reads as the live
 * page's (R12), and the order, evidence, cover, meta and More projects follow
 * design spec 9.
 */

const projects = getAllPortfolioProjects();
const ventures = getAllVentures().filter((venture) => venture.caseStudy);
const studies = allCaseStudies();

/** Every string the template can print for a case, in one list. */
function strings(study: CaseStudy): string[] {
  const out: string[] = [
    study.name,
    study.tagline,
    study.titleName,
    study.eyebrow,
    study.lead,
    study.back.label,
    ...(study.external ? [study.external.label, study.external.href] : []),
    ...(study.byline ? [study.byline.author.label, study.byline.role] : []),
    ...study.meta.flatMap((item) => [item.label, item.value]),
  ];
  const { figures, part } = study.evidence;
  if (figures) {
    out.push(figures.heading);
    for (const item of figures.items) {
      out.push(item.label, item.value, ...(item.note ? [item.note] : []));
    }
  }
  if (part) out.push(part.heading, part.text);
  if (study.cover?.kind === "screenshot") {
    out.push(study.cover.image.src, study.cover.image.alt);
  }
  if (study.cover?.kind === "illustration") out.push(study.cover.label);
  const block = (b: CaseBlock): string[] => {
    switch (b.type) {
      case "prose":
        return [...b.paragraphs];
      case "facts":
        return b.items.flatMap((item) => [item.label, item.value]);
      case "points":
        return [...b.items];
      case "steps":
        return [
          b.label,
          ...b.steps.flatMap((s) => [s.label, ...(s.detail ? [s.detail] : [])]),
        ];
      case "layers":
        return b.layers.flatMap((layer) => [
          layer.label,
          ...layer.nodes.flatMap((n) => [n.label, ...(n.note ? [n.note] : [])]),
        ]);
      case "chips":
        return [b.label, ...b.items];
      case "links":
        return [
          ...b.links.flatMap((l) => [l.label, l.href]),
          ...(b.more ? [b.more.label] : []),
        ];
      case "showcase":
        return b.tiles.flatMap((t) => [t.title, ...(t.text ? [t.text] : [])]);
    }
  };
  for (const chapter of study.chapters) {
    out.push(chapter.title, ...chapter.blocks.flatMap(block));
  }
  return out;
}

describe("the case-study view model", () => {
  it("covers the five projects and both ventures, in that order", () => {
    expect(studies.map((study) => `${study.kind}:${study.slug}`)).toEqual([
      ...projects.map((p) => `project:${p.slug}`),
      ...ventures.map((v) => `venture:${v.slug}`),
    ]);
    expect(studies).toHaveLength(7);
  });

  it("keeps each live page's h1 text exactly (R12), as the parity gate reads it", () => {
    const pages = parity as Record<string, { h1?: string }>;
    for (const study of studies) {
      expect(caseHeading(study), study.path).toBe(pages[study.path]?.h1);
    }
  });

  it("serves each case at its live address", () => {
    for (const study of studies) {
      const section = study.kind === "project" ? "portfolio" : "ventures";
      expect(study.path).toBe(`/${section}/${study.slug}`);
      expect(study.href).toBe(study.path);
    }
  });

  it("finds a case by its slug, and none for an unknown one or a venture without a case", () => {
    expect(findProjectCase("tbh-intranet")?.name).toBe("TBH Intranet");
    expect(findVentureCase("gogocash")?.name).toBe("GoGoCash");
    expect(findProjectCase("gogocash")).toBeNull();
    expect(findVentureCase("tbh-intranet")).toBeNull();
    expect(findProjectCase("nope")).toBeNull();
  });
});

describe("every field of a project reaches its case", () => {
  for (const project of projects) {
    it(project.slug, () => {
      const printed = strings(projectCase(project));
      const has = (text: string) =>
        expect(
          printed.some((line) => line.includes(text)),
          text,
        ).toBe(true);
      for (const text of [
        project.name,
        project.tagline,
        project.summary,
        project.category,
        project.role,
        project.organization,
        project.period,
        caseAccess(project.access),
        ...project.stack,
        ...project.highlights,
        ...project.sections.flatMap((s) => [s.heading, s.body]),
        ...(project.beforeAfter
          ? [project.beforeAfter.before, project.beforeAfter.after]
          : []),
        ...(project.outcomes ?? []).flatMap((o) => [o.label, o.value]),
        ...(project.myPart ? [project.myPart] : []),
        ...(project.url ? [project.url] : []),
        ...(project.urlLabel ? [project.urlLabel] : []),
        ...(project.cover ? [project.cover.src, project.cover.alt] : []),
        ...(project.gallery ?? []).flatMap((g) => [g.alt]),
        ...(project.workflow
          ? [
              project.workflow.title,
              ...project.workflow.steps.flatMap((s) => [
                s.label,
                ...(s.detail ? [s.detail] : []),
              ]),
            ]
          : []),
        ...(project.architecture?.layers ?? []).flatMap((layer) => [
          layer.label,
          ...layer.nodes.flatMap((n) => [n.label, ...(n.note ? [n.note] : [])]),
        ]),
      ])
        has(text);
      const study = projectCase(project);
      // The mockup is the cover when no screenshot is registered.
      if (!project.cover && project.mockup) {
        expect(study.cover).toMatchObject({
          kind: "illustration",
          art: { type: "mockup", mockup: project.mockup },
        });
      }
    });
  }
});

describe("every field of a venture reaches its case", () => {
  for (const venture of ventures) {
    it(venture.slug, () => {
      const study = ventureCase(venture);
      const printed = strings(study);
      const has = (text: string) =>
        expect(
          printed.some((line) => line.includes(text)),
          text,
        ).toBe(true);
      const caseStudy = venture.caseStudy!;
      for (const text of [
        venture.name,
        venture.tagline,
        venture.role,
        String(venture.year),
        venture.urlLabel,
        venture.url,
        caseCopy.status[venture.status],
        caseStudy.intro,
        caseStudy.timeline,
        ...caseStudy.sections.flatMap((s) => [s.heading, s.body]),
        ...(caseStudy.loop ?? []),
        ...venture.stack,
        ...(venture.offer ? [venture.offer.label] : []),
        ...(venture.metrics ?? []).flatMap((m) => [
          m.label,
          m.value,
          ...(m.asOf ? [`As of ${m.asOf}`] : []),
        ]),
        ...(VENTURE_RELATED_TOPICS[venture.slug] ?? [])
          .filter((link) => BLOG_PUBLIC || !isBlogHref(link.href))
          .map((link) => link.label),
      ])
        has(text);
      expect(study.logo).toBe(venture.logo);
    });
  }
});

describe("the evidence rows (spec 9.3)", () => {
  it("states a project's cleared outcomes, sourced to the résumé", () => {
    const study = findProjectCase("tbh-intranet")!;
    expect(study.evidence.figures).toEqual({
      heading: "Outcome",
      items: [
        { label: "Adoption", value: "50+ employees" },
        { label: "Build cycles", value: "4 months to 1 week" },
      ],
      source: { label: "As stated in the résumé →", href: "/resume" },
    });
    expect(study.evidence.part?.heading).toBe("My part");
    expect(study.firstOutcome).toBe("Adoption: 50+ employees");
  });

  it("shows his part and no outcome on a case with no cleared figure", () => {
    const study = findProjectCase("node-validator-automation")!;
    expect(study.evidence.figures).toBeUndefined();
    expect(study.evidence.part).toEqual({
      heading: "My part",
      text: "Wrote code for it.",
    });
    expect(study.firstOutcome).toBeUndefined();
  });

  it("shows neither on the site's own case", () => {
    const study = findProjectCase("kunanonj-com")!;
    expect(study.evidence).toEqual({ figures: undefined, part: undefined });
  });

  it("puts a venture's figures in the Outcome place, each total with its month", () => {
    const study = findVentureCase("gogocash")!;
    const figures = study.evidence.figures!;
    expect(figures.heading).toBe("Venture metrics");
    expect(figures.source).toBeUndefined();
    const venture = getVentureBySlug("gogocash")!;
    expect(figures.items).toEqual(
      venture.metrics!.map((metric) => ({
        label: metric.label,
        value: metric.value,
        note: metric.asOf ? `As of ${metric.asOf}` : undefined,
      })),
    );
    expect(
      figures.items.filter((item) => item.note === "As of October 2026"),
    ).toHaveLength(2);
  });

  it('moves a venture\'s "My role" section to the My part place, out of the chapters', () => {
    for (const venture of ventures) {
      const study = ventureCase(venture);
      const role = venture.caseStudy!.sections.find(
        (s) => s.heading === "My role",
      )!;
      expect(study.evidence.part).toEqual({
        heading: "My role",
        text: role.body,
      });
      expect(study.chapters.map((c) => c.title)).not.toContain("My role");
    }
    expect(findVentureCase("manut")!.evidence.figures).toBeUndefined();
  });
});

describe("the hero, cover and meta row (spec 9.2, 9.4, 9.5)", () => {
  it("names the back link after the breadcrumb's parent", () => {
    expect(findProjectCase("ai-automation")!.back).toEqual({
      label: "All projects",
      href: "/portfolio",
    });
    // Home's ventures card: /#ventures since the cutover (Phase 6).
    expect(findVentureCase("manut")!.back).toEqual({
      label: "Ventures",
      href: "/#ventures",
    });
  });

  it("reads the eyebrow from the category and period, or the venture's timeline", () => {
    expect(findProjectCase("tbh-intranet")!.eyebrow).toBe(
      "Internal platform · May to Oct 2026",
    );
    expect(findVentureCase("gogocash")!.eyebrow).toBe(
      `Venture · ${getVentureBySlug("gogocash")!.caseStudy!.timeline}`,
    );
  });

  it("links out only where the case is public, and keeps the live labels", () => {
    expect(findProjectCase("tbh-intranet")!.external).toBeUndefined();
    expect(findProjectCase("kunanonj-com")!.external).toEqual({
      label: "Source on GitHub",
      href: "https://github.com/KunanonJ/fronk-website",
    });
    expect(findVentureCase("gogocash")!.external).toEqual({
      label: "Visit gogocash.co",
      href: "https://gogocash.co",
    });
  });

  it("covers a project with its screenshot, else its mockup; a venture with its loop", () => {
    expect(findProjectCase("kunanonj-com")!.cover?.kind).toBe("screenshot");
    expect(findProjectCase("tbh-intranet")!.cover).toMatchObject({
      kind: "illustration",
      label: "Illustrative mockup of TBH Intranet",
    });
    expect(findVentureCase("gogocash")!.cover).toMatchObject({
      kind: "illustration",
      art: { type: "venture", loop: true },
    });
    expect(findVentureCase("manut")!.cover).toMatchObject({
      kind: "illustration",
      art: { type: "venture", loop: false },
    });
  });

  it("prints the Access value the live pages print", () => {
    expect(caseAccess("internal")).toBe("Internal tool (no public link)");
    expect(caseAccess("public")).toBe("Public");
  });

  it("lists Role, Organisation, Period and Access, or Role, Started, Status and Offer", () => {
    expect(findProjectCase("tbh-intranet")!.meta.map((m) => m.label)).toEqual([
      "Role",
      "Organisation",
      "Period",
      "Access",
    ]);
    expect(findVentureCase("gogocash")!.meta).toEqual([
      { label: "Role", value: "Founder" },
      { label: "Started", value: "2023" },
      { label: "Status", value: "Live" },
      { label: "Offer", value: "Free to start" },
    ]);
  });

  it("wears the material of its card on the Home stack", () => {
    for (const card of stackCards()) {
      const study = studies.find(
        (s) => s.kind === card.kind && s.slug === card.slug,
      )!;
      expect(study.hue, card.slug).toBe(card.hue);
    }
  });
});

describe("the chapters (spec 9.7)", () => {
  it("numbers them in order, with their anchors", () => {
    for (const study of studies) {
      study.chapters.forEach((chapter, i) => {
        const number = String(i + 1).padStart(2, "0");
        expect(chapter.number).toBe(number);
        expect(chapter.id).toBe(`ch-${number}`);
        expect(chapter.headline).toBeUndefined();
      });
    }
  });

  it("orders a project's chapters as the live page's cards", () => {
    expect(
      findProjectCase("tbh-intranet")!.chapters.map((c) => c.title),
    ).toEqual([
      "The problem",
      "What it does",
      "How it works",
      "Architecture",
      "How it is built",
      "Tech stack",
    ]);
  });

  it("shows the before and after under the problem, only where the copy names both", () => {
    const [problem] = findProjectCase("tbh-intranet")!.chapters;
    expect(problem!.blocks[1]).toEqual({
      type: "facts",
      items: [
        { label: "Before", value: "Zoho" },
        { label: "After", value: "One login-only web app" },
      ],
    });
    for (const slug of ["ai-automation", "kunanonj-com"]) {
      const [first] = findProjectCase(slug)!.chapters;
      expect(first!.blocks.map((b) => b.type)).toEqual(["prose"]);
    }
  });

  it("draws the workflow and the architecture side by side, the workflow moving", () => {
    const does = findProjectCase("ai-automation")!.chapters[1]!;
    const showcase = does.blocks.find((b) => b.type === "showcase");
    expect(showcase).toBeDefined();
    if (showcase?.type !== "showcase") return;
    expect(showcase.tiles.map((t) => [t.id, t.size, t.animated])).toEqual([
      ["flow", "half", true],
      ["layers", "half", false],
    ]);
    const [flow, layers] = showcase.tiles;
    expect(flow!.title).toBe("Fando clip pipeline");
    expect(flow!.media).toMatchObject({
      kind: "illustration",
      art: { type: "flow" },
    });
    expect(layers!.title).toBe("Architecture");
    expect(layers!.text).toBe(
      "Sources · Agents · AI · Human in the loop · Media + publishing · Also in the repo",
    );
  });

  it("orders a venture's chapters as the live page's cards, with its related topics", () => {
    expect(findVentureCase("gogocash")!.chapters.map((c) => c.title)).toEqual([
      "What it is",
      "Where it stands",
      "Related topics",
    ]);
    expect(findVentureCase("manut")!.chapters.map((c) => c.title)).toEqual([
      "What it is",
      "Why it matters in Thailand & SEA",
      "Related topics",
    ]);
    const stands = findVentureCase("gogocash")!.chapters[1]!;
    expect(stands.blocks[1]).toEqual({
      type: "steps",
      label: "The core loop",
      steps: getVentureBySlug("gogocash")!.caseStudy!.loop!.map((label) => ({
        label,
      })),
    });
  });

  it("links no hidden blog post while the blog is hidden", () => {
    for (const study of studies.filter((s) => s.kind === "venture")) {
      const links = study.chapters
        .flatMap((c) => c.blocks)
        .flatMap((b) => (b.type === "links" ? b.links : []));
      expect(links.length).toBeGreaterThan(0);
      if (!BLOG_PUBLIC) {
        expect(links.filter((l) => isBlogHref(l.href))).toEqual([]);
      }
    }
  });
});

describe("More projects (spec 9.12)", () => {
  it("shows the next two projects in list order, wrapping at the end", () => {
    const slugs = projects.map((p) => p.slug);
    slugs.forEach((slug, i) => {
      expect(findProjectCase(slug)!.more.map((card) => card.slug)).toEqual([
        slugs[(i + 1) % slugs.length],
        slugs[(i + 2) % slugs.length],
      ]);
    });
  });

  it("shows the other venture and the first featured project on a venture", () => {
    expect(findVentureCase("gogocash")!.more.map((c) => c.slug)).toEqual([
      "manut",
      FEATURED_PORTFOLIO_SLUGS[0],
    ]);
    expect(findVentureCase("manut")!.more.map((c) => c.slug)).toEqual([
      "gogocash",
      FEATURED_PORTFOLIO_SLUGS[0],
    ]);
  });

  it("links each card to its case, with its meta and tagline", () => {
    const [card] = findProjectCase("tbh-intranet")!.more;
    const project = projects.find((p) => p.slug === card!.slug)!;
    expect(card).toMatchObject({
      href: `/portfolio/${project.slug}`,
      name: project.name,
      meta: [project.category, project.period],
      summary: project.tagline,
    });
    const venture = findVentureCase("manut")!.more[0]!;
    expect(venture.meta).toEqual([
      "Venture",
      getVentureBySlug("gogocash")!.caseStudy!.timeline,
    ]);
  });
});

describe("the template's labels", () => {
  it("keep the names the smoke tests read", () => {
    expect(caseCopy.outcome).toBe("Outcome");
    expect(caseCopy.part).toBe("My part");
    expect(caseCopy.interface).toBe("Interface");
    expect(caseCopy.hire.kicker).toBe("Hiring");
    expect(caseCopy.hire.resume).toEqual({ label: "Résumé", href: "/resume" });
    expect(caseCopy.hire.contact).toEqual({
      label: "Contact",
      href: "/contact?topic=hiring",
    });
  });

  it('start a drawn cover\'s caption with "Illustration" (owner decision 4)', () => {
    expect(caseCopy.coverCaption.startsWith("Illustration")).toBe(true);
  });

  it("restate the first outcome line as the content module prints it", () => {
    for (const project of projects) {
      const first = project.outcomes?.[0];
      expect(projectCase(project).firstOutcome).toBe(
        first ? outcomeLine(first) : undefined,
      );
    }
  });
});
