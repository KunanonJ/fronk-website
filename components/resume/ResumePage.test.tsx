import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import ResumePage from "@/components/resume/ResumePage";
import { ResumePrint } from "@/components/resume/ResumePrint";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import type { ResumeDetail } from "@/lib/resume/search";

const profile = resolveResumeProfile(null);

function renderPage(detail: ResumeDetail = "detailed") {
  const onDetailChange = vi.fn();
  const utils = render(
    <ChromeProvider>
      <ResumePage
        profile={profile}
        detail={detail}
        onDetailChange={onDetailChange}
      />
    </ChromeProvider>,
  );
  return { ...utils, onDetailChange };
}

describe("ResumePage (screen)", () => {
  it("leads with the canvas h1 built from the name and headline", () => {
    renderPage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "Kunanon Jarat. Founder. IT Manager & AI Engineering Lead. Based in Bangkok.",
    );
    expect(h1.className).toMatch(/kj-lines/);
    expect(h1.children).toHaveLength(3);
  });

  it("offers the PDF, Share and the detail control", () => {
    const { onDetailChange } = renderPage();
    expect(
      screen.getAllByRole("link", { name: "Download PDF" })[0],
    ).toHaveAttribute("href", "/resume.pdf");
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute(
      "data-panel-trigger",
    );
    const group = screen.getByRole("group", { name: "Résumé detail" });
    expect(
      within(group).getByRole("button", { name: "Detailed" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(group).getByRole("button", { name: "Compact" }));
    expect(onDetailChange).toHaveBeenCalledWith("compact");
  });

  it("draws every CMS section as a labelled card", () => {
    renderPage();
    for (const section of profile.sections)
      expect(
        screen.getByRole("article", { name: section.title }),
      ).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Skills" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Share" })).toBeInTheDocument();
  });

  it("numbers Experience across its two columns", () => {
    renderPage();
    const card = screen.getByRole("article", { name: "Experience" });
    const columns = card.querySelectorAll("ol");
    expect(columns).toHaveLength(2);
    expect(columns[1]).toHaveAttribute("start", "6");
    expect(card.textContent).toContain("01");
    expect(card.textContent).toContain("10");
  });

  it("spans University-era two columns from 641px and starts it at column 2 only on desktop", () => {
    renderPage();
    const card = screen.getByRole("article", { name: "University-era" });
    expect(card.className).toMatch(/min-\[641px\]:col-span-2/);
    expect(card.className).toMatch(/lg:col-\[2\/span_2\]/);
    expect(card.className).toMatch(/lg:row-span-2/);
    expect(card.className).not.toMatch(/(^| )col-start|min-\[641px\]:col-\[/);
  });

  it("marks the live ventures with the Ember square", () => {
    const { container } = renderPage();
    const current = screen.getByRole("article", { name: "Currently" });
    expect(
      within(current).getByText("Live at gogocash.co."),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("li > .bg-ember").length).toBe(2);
  });

  it("hides the bullet lists in the compact view", () => {
    renderPage("compact");
    expect(screen.queryByText("Live at gogocash.co.")).toBeNull();
    expect(screen.getByRole("button", { name: "Compact" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Roles, periods and skills stay.
    expect(screen.getAllByText("Founder").length).toBeGreaterThan(0);
    expect(screen.getByText("Product strategy")).toBeInTheDocument();
  });

  it("shares the canonical URL under the page title", () => {
    renderPage();
    const share = screen.getByRole("article", { name: "Share" });
    expect(share).toHaveTextContent("Resume — Fronk Kunanon Jarat");
    const x = within(share).getByRole("link", { name: "Post on X" });
    expect(x.getAttribute("href")).toContain(
      encodeURIComponent("Resume — Fronk Kunanon Jarat"),
    );
    expect(x.getAttribute("href")).toMatch(
      /url=https?%3A%2F%2F[^&]+%2Fresume$/,
    );
  });

  it("hides both screen parts in print", () => {
    const { container } = renderPage();
    for (const part of container.querySelectorAll("section, .bento"))
      expect(part).toHaveAttribute("data-print-hide");
  });
});

describe("ResumePrint", () => {
  it("still prints every section with all its bullets", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    expect(container.querySelector("main")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Kunanon Jarat.",
    );
    expect(screen.getByText("Live at gogocash.co.")).toBeInTheDocument();
  });
});
