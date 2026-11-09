import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import SkillDetailPage from "@/components/landing/skills/SkillDetailPage";
import SkillsCatalog from "@/components/landing/skills/SkillsCatalog";
import SkillsIndexPage from "@/components/landing/skills/SkillsIndexPage";
import {
  SKILL_STAGES,
  USER_INVOKED_COUNT,
  getAllSkills,
  getSkillBySlug,
  skillsPage,
  type Skill,
} from "@/lib/content/skills";

function skill(slug: string): Skill {
  const found = getSkillBySlug(slug);
  if (!found) throw new Error(`no skill ${slug}`);
  return found;
}

function renderDetail(slug: string) {
  return render(
    <ChromeProvider>
      <SkillDetailPage skill={skill(slug)} />
    </ChromeProvider>,
  );
}

const stageCards = () =>
  SKILL_STAGES.map((stage) =>
    screen.queryByRole("article", { name: stage.label }),
  ).filter(Boolean);

describe("SkillsCatalog", () => {
  it("shows every stage and skill when the filter is all", () => {
    render(<SkillsCatalog show="all" onShowChange={() => {}} />);
    expect(stageCards()).toHaveLength(SKILL_STAGES.length);
    for (const s of getAllSkills()) {
      expect(screen.getByRole("article", { name: s.name })).toBeVisible();
    }
    expect(screen.getByText("Showing all 20 skills")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^All/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("narrows to the skills you invoke and drops stages left empty", () => {
    render(<SkillsCatalog show="user" onShowChange={() => {}} />);
    const shown = getAllSkills().filter((s) => s.userInvoked);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      shown.length,
    );
    expect(
      screen.getByText(`Showing ${USER_INVOKED_COUNT} of 20 skills`),
    ).toBeInTheDocument();
    // Verify and ship holds only skills the agent loads on its own.
    expect(
      screen.queryByRole("article", { name: "Verify and ship" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: /^You invoke/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("asks the route for a new filter instead of filtering locally", () => {
    const onShowChange = vi.fn();
    render(<SkillsCatalog show="all" onShowChange={onShowChange} />);
    fireEvent.click(screen.getByRole("button", { name: /^Adapted/ }));
    expect(onShowChange).toHaveBeenCalledWith("adapted");
  });
});

describe("SkillsIndexPage", () => {
  it("keeps the h1 text and the anchors the detail pages link to", () => {
    const { container } = render(
      <ChromeProvider>
        <SkillsIndexPage show="all" onShowChange={() => {}} />
      </ChromeProvider>,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      skillsPage.title,
    );
    for (const id of ["install", "pipeline", "catalog"]) {
      expect(container.querySelector(`article#${id}`), id).not.toBeNull();
    }
    expect(
      screen.getByRole("link", {
        name: /^Download plugin ZIP: superstacks-plugin\.zip, \d+ KB$/,
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it("lists the pipeline in README order with the draft note last", () => {
    render(
      <ChromeProvider>
        <SkillsIndexPage show="all" onShowChange={() => {}} />
      </ChromeProvider>,
    );
    const pipeline = screen.getByRole("article", { name: "The pipeline" });
    const steps = within(pipeline).getAllByRole("listitem");
    expect(steps).toHaveLength(8);
    expect(steps.at(-1)).toHaveTextContent("pr(draft)");
  });
});

describe("SkillDetailPage", () => {
  it("draws verify-loop as the canvas does: original, automatic, with scripts", () => {
    renderDetail("verify-loop");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /^verify-loop$/,
    );
    const origin = screen.getByRole("article", { name: "Origin" });
    expect(origin).toHaveTextContent("Written for Superstacks");
    const runs = screen.getByRole("article", { name: "How it runs" });
    expect(runs).toHaveTextContent("Runs automatically.");
    const files = screen.getByRole("article", { name: "Files" });
    expect(within(files).getAllByRole("listitem")).toHaveLength(4);
    expect(within(files).getAllByRole("link")[0]).toHaveAccessibleName(
      /^SKILL\.md, [\d.]+ KB, opens on GitHub$/,
    );
    // The ZIP tabs are hidden until picked; their names start with the
    // visible words and add the size.
    expect(
      screen.getByRole("link", {
        name: /^Download verify-loop\.zip, [\d.]+ KB$/,
        hidden: true,
      }),
    ).toBeInTheDocument();
  });

  it("gives an adapted skill its upstream, pinned commit and patches", () => {
    renderDetail("code-review");
    const origin = screen.getByRole("article", { name: "Origin" });
    expect(origin).toHaveTextContent("Adapted");
    expect(origin).toHaveTextContent(/From mattpocock\/skills/i);
    expect(origin).toHaveTextContent("Matt Pocock");
    expect(
      within(origin).getByRole("link", { name: "code-review.patch" }),
    ).toBeInTheDocument();
    expect(
      within(origin).getByRole("link", { name: /^4588b32/ }),
    ).toHaveAttribute("href", skill("code-review").upstreamUrl);
    // A skill without scripts lists just its SKILL.md.
    const files = screen.getByRole("article", { name: "Files" });
    expect(within(files).getAllByRole("listitem")).toHaveLength(1);
  });

  it("credits the excerpt inside pr", () => {
    renderDetail("pr");
    expect(screen.getByRole("article", { name: "Origin" })).toHaveTextContent(
      /credited excerpt from show-me \(humanlayer\/skills\)/,
    );
  });

  it("tells you to invoke a user-invoked skill by name", () => {
    renderDetail("gardening");
    const runs = screen.getByRole("article", { name: "How it runs" });
    expect(runs).toHaveTextContent("You invoke it.");
    expect(runs).toHaveTextContent("disable-model-invocation: true");
    const about = screen.getByRole("list", { name: "About this skill" });
    expect(about).toHaveTextContent("You invoke");
  });

  it("folds a long SKILL.md and keeps the rest in the page", () => {
    renderDetail("verify-loop");
    const total = skill("verify-loop")
      .content.replace(/\n+$/, "")
      .split("\n").length;
    const toggle = screen.getByRole("button", {
      name: `Show all ${total} lines`,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    const well = document.getElementById("skill-md")!;
    const [, rest] = well.querySelectorAll("pre");
    expect(rest).not.toBeVisible();
    expect(rest!.textContent).toContain("## Rules");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveTextContent("Show fewer lines");
    expect(rest).toBeVisible();
  });

  it("shows a short SKILL.md whole, with no toggle", () => {
    renderDetail("grill-with-docs");
    expect(screen.queryByRole("button", { name: /^Show all/ })).toBeNull();
    expect(document.getElementById("skill-md")!.textContent).toBe(
      skill("grill-with-docs").content.replace(/\n+$/, ""),
    );
  });
});
