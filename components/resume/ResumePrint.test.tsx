import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PRINT_FONT, ResumePrint } from "@/components/resume/ResumePrint";
import { OPEN_TO_ROLES } from "@/lib/content/identity";
import { resolveResumeProfile } from "@/lib/content/resumeProfile";
import { isLiveBullet, printGroups } from "@/lib/resume/view";
import { siteConfig } from "@/lib/site";

const profile = resolveResumeProfile(null);

/*
 * The printed résumé is read by people and parsed by applicant-tracking
 * systems. These tests guard the causes of the broken PDF found on 10-11-26:
 * no contact details, entries faded with opacity (their text left the PDF in
 * fragments and out of order), and decorative text joined to the job titles.
 * They check the HTML that Chromium prints; the PDF itself is checked by
 * `pnpm pdf` (page count) and by reading its text layer back.
 */
describe("ResumePrint", () => {
  it("heads the page with the name, the headline and the availability", () => {
    render(<ResumePrint profile={profile} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /^Kunanon Jarat$/,
    );
    expect(screen.getByText(profile.headline)).toBeInTheDocument();
    expect(screen.getByText(OPEN_TO_ROLES.sentence)).toBeInTheDocument();
    expect(screen.getByText(profile.summary)).toBeInTheDocument();
  });

  it("carries the contact details as real links with readable labels", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    const contact = container.querySelector("[data-resume-contact]")!;
    expect(contact).toHaveTextContent("Bangkok, Thailand");
    const links = within(contact as HTMLElement).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      `mailto:${siteConfig.email}`,
      siteConfig.url,
      siteConfig.socials.linkedin,
      siteConfig.socials.github,
    ]);
    expect(links[0]).toHaveTextContent(siteConfig.email);
    expect(links[2]).toHaveTextContent("linkedin.com/in/kunanonj");
    expect(links[3]).toHaveTextContent("github.com/KunanonJ");
  });

  it("never carries a phone number", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    expect(container.textContent).not.toMatch(
      /\+66|\b0\d{1,2}[- ]?\d{3}[- ]?\d{4}\b/,
    );
    expect(container.querySelector('a[href^="tel:"]')).toBeNull();
  });

  it("sets the sections in the CV's order", () => {
    render(<ResumePrint profile={profile} />);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent),
    ).toEqual([
      "Summary",
      "Experience",
      "Independent projects",
      "Core skills",
      "Education and training",
    ]);
  });

  it("prints every role with its period, its note and all its bullets", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    const entries = printGroups(profile.sections).filter(
      (group) => group.kind === "entries",
    );
    const articles = [...container.querySelectorAll("article")];
    const items = entries.flatMap((group) => group.items);
    expect(articles).toHaveLength(items.length);
    items.forEach((item, i) => {
      const article = articles[i]!;
      expect(article.querySelector("h3")).toHaveTextContent(item.title);
      // The period sits beside the title, written with a plain hyphen.
      expect(article.querySelector("h3 + span")).toHaveTextContent(
        item.period.replace(" — ", " - "),
      );
      expect(article).toHaveTextContent(item.org);
      if (item.note) expect(article).toHaveTextContent(item.note);
      // A "Live at ..." bullet only repeats the printed site link.
      for (const bullet of (item.bullets ?? []).filter((b) => !isLiveBullet(b)))
        expect(article).toHaveTextContent(bullet);
    });
    // Not derived from printGroups: the current role leads, the internship ends Experience.
    expect(articles[0]).toHaveTextContent(
      "IT Manager & AI Engineering LeadSep 2025 - Present",
    );
    expect(articles[9]).toHaveTextContent(
      "Smart Contract InternNov 2021 - Jan 2022",
    );
    expect(articles.at(-1)).toHaveTextContent("GoSparkIn development");
  });

  it("writes periods with a plain hyphen and prints each project's site once", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    expect(container.textContent).toContain("Sep 2025 - Present");
    expect(container.textContent).not.toMatch(
      /[—–] (Present|[A-Z][a-z]{2} \d{4})/,
    );
    expect(screen.getByRole("link", { name: "gogocash.co" })).toHaveAttribute(
      "href",
      "https://gogocash.co",
    );
    expect(screen.queryByText("Live at gogocash.co.")).toBeNull();
  });

  it("prints in a static system font, not the variable site font", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    const root = container.querySelector<HTMLElement>("[data-resume-print]")!;
    expect(root.style.fontFamily).toBe(PRINT_FONT);
    expect(PRINT_FONT).not.toMatch(/Geist|var\(/);
  });

  it("leaves the screen-only sections out, so it fits two pages", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    expect(container.textContent).not.toContain("TEDx");
    expect(container.textContent).not.toContain("Protocol Camp");
  });

  it("sets education and training one line each", () => {
    render(<ResumePrint profile={profile} />);
    expect(
      screen.getByText("Kasetsart University · Bangkok").closest("p"),
    ).toHaveTextContent(
      "Kasetsart University · Bangkok | B.Eng. Electrical Engineering | Aug 2017 - Apr 2021",
    );
    expect(
      screen.getByText("Anthropic Academy").closest("p"),
    ).toHaveTextContent(/Building with the Claude API.* \| May 2026$/);
  });

  it("lists the skills by group as plain text", () => {
    render(<ResumePrint profile={profile} />);
    expect(screen.getByText("AI & Cloud:").closest("p")).toHaveTextContent(
      `AI & Cloud: ${profile.skills[0]!.items.join(", ")}.`,
    );
  });

  it("uses nothing that breaks the PDF text layer", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    // Opacity below 1 makes Chromium draw the element as a transparency
    // group; letter-spacing makes extractors split or join words.
    for (const element of container.querySelectorAll<HTMLElement>("*")) {
      expect(element.style.opacity, element.tagName).toBe("");
      expect(element.style.letterSpacing, element.tagName).toBe("");
      expect(element.getAttribute("class") ?? "").not.toMatch(
        /(^|[\s:])(opacity-|tracking-|blur|mix-blend)/,
      );
    }
    // No logo tiles and no decorative text: they would join the titles.
    expect(container.querySelector("[data-logo], img, svg")).toBeNull();
    expect(container.querySelector("[aria-hidden]")).toBeNull();
    // No running index numbers ("01", "02") beside the entries.
    const texts = [...container.querySelectorAll("span, p, h2, h3, li")].map(
      (element) => element.textContent?.trim() ?? "",
    );
    expect(texts.filter((text) => /^\d{1,2}$/.test(text))).toEqual([]);
  });

  it("keeps every text size at or above the 12 px floor", () => {
    const { container } = render(<ResumePrint profile={profile} />);
    const sizes = [
      ...container.innerHTML.matchAll(/text-\[(\d+(?:\.\d+)?)px\]/g),
    ];
    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes)
      expect(Number(size[1])).toBeGreaterThanOrEqual(12);
  });
});
