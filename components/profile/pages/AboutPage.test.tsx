import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AboutPage from "@/components/profile/pages/AboutPage";
import { aboutPage } from "@/lib/content/aboutPage";
import { AVAILABILITY } from "@/lib/content/availability";
import { aboutRecruiterLinks } from "@/lib/content/contact";
import { FAQ_ITEMS } from "@/lib/content/faq";
import { aboutCopy } from "@/lib/content/homeWorkAbout";
import { socials } from "@/lib/content/landing";
import { learnOperatorNotes } from "@/lib/content/learn";
import { operatingModel } from "@/lib/content/operatingModel";

/*
 * /about after the Phase 6 cutover (plan step 6d), the same intents as the
 * bento page's tests it replaces (AboutHero.test.tsx and
 * AboutPageContent.test.tsx, umbrella input R17): the h1 word for word, the
 * availability, the portrait first, the buttons, the socials, the section ids
 * other pages link, every FAQ answer in the HTML, and the Next card.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  // The GitHub year fetches on mount; keep tests offline.
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ ok: false }), { status: 503 }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AboutPage: the hero", () => {
  it("leads with the h1, word for word the live page's, the eyebrow and the role", () => {
    render(<AboutPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      "About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok.",
    );
    expect(h1.className).toMatch(/t-display/);
    expect(h1.querySelectorAll(".pf-page-hero__line")).toHaveLength(3);
    expect(screen.getByText(aboutPage.hero.role)).toBeInTheDocument();
    expect(screen.getByText("Fronk · Bangkok, Thailand")).toBeInTheDocument();
  });

  it("says who he is open to hearing from, between the role and the buttons", () => {
    render(<AboutPage />);
    const line = screen.getByText(AVAILABILITY.pill.label).closest("p")!;
    expect(line).toHaveTextContent(AVAILABILITY.pill.detail);
    const role = screen.getByText(aboutPage.hero.role);
    const contact = screen.getByRole("link", { name: "Contact me" });
    expect(
      role.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      line.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the portrait, loaded first", () => {
    render(<AboutPage />);
    const portrait = screen.getByRole("img", {
      name: aboutPage.hero.portraitAlt,
    });
    expect(portrait.getAttribute("src")).toContain("/profile-portrait.webp");
    expect(portrait).toHaveAttribute("fetchpriority", "high");
  });

  it("offers a dark Contact pill, the work and a jump to the story", () => {
    render(<AboutPage />);
    const contact = screen.getByRole("link", { name: "Contact me" });
    expect(contact).toHaveAttribute("href", "/contact");
    expect(contact.className).toMatch(/\bds-pill\b/);
    expect(contact.className).not.toMatch(/ds-pill--ghost/);
    expect(screen.getByRole("link", { name: "See my work" })).toHaveAttribute(
      "href",
      "/portfolio",
    );
    expect(screen.getByRole("link", { name: "Read my story" })).toHaveAttribute(
      "href",
      "#story",
    );
  });

  it("links every social profile with an accessible name, opening in a new tab", () => {
    render(<AboutPage />);
    const list = screen.getByRole("list", { name: "Social profiles" });
    for (const { label, href } of socials) {
      const link = within(list).getByRole("link", {
        name: `${label} (opens in a new tab)`,
      });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", expect.stringContaining("me"));
    }
  });

  it("has no email signup and no background video", () => {
    const { container } = render(<AboutPage />);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector("video")).toBeNull();
  });
});

describe("AboutPage: the sections", () => {
  it("keeps the section ids that the hero, Learn and the operating model link to", () => {
    const { container } = render(<AboutPage />);
    const ids = [
      aboutPage.hero.storyHref.slice(1),
      ...learnOperatorNotes.map((note) => note.href.split("#")[1]!),
      "how-i-ship",
      "stack",
      "activity",
    ];
    for (const id of ids) {
      expect(container.querySelector(`#${id}`), id).not.toBeNull();
    }
  });

  it("reuses the redesign's parts: the About bento, the story and the career records", () => {
    const { container } = render(<AboutPage />);
    expect(
      container.querySelector("section.pf-about#principles"),
    ).not.toBeNull();
    expect(container.querySelector("#story .pf-story")).not.toBeNull();
    expect(container.querySelector("aside.pf-records")).not.toBeNull();
  });

  it("anchors #story on the section, so Read my story lands on its heading (review finding 9)", () => {
    const { container } = render(<AboutPage />);
    const story = container.querySelectorAll("#story");
    expect(story).toHaveLength(1);
    expect(story[0]!.tagName).toBe("SECTION");
    // The heading is inside the anchor, before the story it heads.
    const heading = within(story[0] as HTMLElement).getByRole("heading", {
      level: 2,
      name: aboutPage.story.heading,
    });
    expect(
      heading.compareDocumentPosition(story[0]!.querySelector(".pf-story")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("makes each section a region named by its own heading", () => {
    const { container } = render(<AboutPage />);
    const named = [
      // The hero, by the h1.
      "About Kunanon Jarat: AI, ERP/CRM and startups in Bangkok.",
      // Home's About bento, reused under #principles, keeps Home's name: its
      // eyebrow, the nav's label (AboutBento.test.tsx pins it).
      aboutCopy.eyebrow,
      aboutPage.story.heading,
      aboutPage.now.heading,
      aboutPage.stack.heading,
      operatingModel.heading,
      aboutPage.faq.heading,
    ];
    const sections = [...container.querySelectorAll("section")];
    expect(sections).toHaveLength(named.length);
    sections.forEach((section, at) => {
      // A no-break space (the h1 keeps its last two words together) reads
      // as a space.
      expect(section).toBe(
        screen.getByRole("region", {
          name: (name) => name.replace(/\s/g, " ") === named[at],
        }),
      );
      // The name comes from the section's own header, not from elsewhere.
      const label = document.getElementById(
        section.getAttribute("aria-labelledby") ?? "",
      )!;
      expect(section, named[at]).toContainElement(label);
      if (at !== 1) expect(label.tagName, named[at]).toMatch(/^H[12]$/);
    });
  });

  it("renders every FAQ answer with text identical to FAQ_ITEMS, only the first open", () => {
    const { container } = render(<AboutPage />);
    const faq = container.querySelector(`#${aboutPage.faq.id}`)!;
    const items = faq.querySelectorAll("details");
    expect(items).toHaveLength(FAQ_ITEMS.length);
    FAQ_ITEMS.forEach((item, i) => {
      const details = items[i]!;
      expect(details.querySelector("summary h3")).toHaveTextContent(
        item.question,
      );
      // Every answer is in the HTML with no hidden attribute, so the page
      // matches the FAQPage JSON-LD and text extractors read all of them.
      const answer = details.querySelector("p")!;
      expect(answer).toHaveTextContent(item.answer);
      expect(answer.closest("[hidden]")).toBeNull();
      expect(details.open).toBe(i === 0);
    });
  });
});

describe("AboutPage: the Next card", () => {
  it("leads its buttons with a dark Contact pill, after the recruiter links", () => {
    render(<AboutPage />);
    const next = screen.getByRole("article", { name: aboutPage.cta.eyebrow });
    const links = within(next).getAllByRole("link");
    // In reading order: the recruiter block's links, then the buttons.
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      ...aboutRecruiterLinks.map((l) => l.href),
      ...aboutPage.cta.links.map((l) => l.href),
    ]);
    // The dark pill serves every reader, so it opens the general form.
    // A string name matches the whole name: not "Get in touch for later".
    const contact = within(next).getByRole("link", { name: "Contact" });
    expect(contact).toHaveAttribute("href", "/contact");
    expect(contact.className).toMatch(/\bds-pill\b/);
  });

  it("answers a recruiter's first questions", () => {
    render(<AboutPage />);
    const next = screen.getByRole("article", { name: aboutPage.cta.eyebrow });
    expect(
      within(next).getByRole("heading", { name: "For recruiters" }),
    ).toBeInTheDocument();
    expect(next).toHaveTextContent(AVAILABILITY.sentence);
    expect(next).toHaveTextContent("Bangkok time, GMT+7.");
    // He is not looking now (owner direction 20-11-26), so the recruiter's
    // link is for later: the form with "A future role" chosen. The arrows
    // are hidden from the names since the cutover (spec 12 item 18).
    expect(
      within(next).queryByRole("link", { name: "Contact about a role" }),
    ).toBeNull();
    expect(
      within(next).getByRole("link", { name: "Get in touch for later" }),
    ).toHaveAttribute("href", "/contact?topic=hiring");
    const pdf = within(next).getByRole("link", { name: "Download PDF" });
    expect(pdf).toHaveAttribute("href", "/resume.pdf");
    expect(pdf).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    const linkedin = within(next).getByRole("link", {
      name: "LinkedIn (opens in a new tab)",
    });
    expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/kunanonj",
    );
    expect(linkedin).toHaveAttribute("target", "_blank");
    // Nothing the owner has not approved: no notice period, no visa status.
    expect(next).not.toHaveTextContent(/notice|visa|authori[sz]/i);
  });
});
