import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import ContactPage from "./ContactPage";
import { composeHref } from "@/lib/content/profileChrome";
import { contactMessages, contactPage } from "@/lib/content/contact";
import { MAILTO_MAX } from "@/lib/contact/compose";

const MESSAGE = "I'd like to talk about Manut AI for our dealership.";

function fill({
  name = "Ada Lovelace",
  message = MESSAGE,
  // The message field's label depends on whether Hiring is chosen.
  messageLabel = contactPage.messagePlaceholder as string,
} = {}) {
  fireEvent.change(screen.getByLabelText(contactPage.namePlaceholder), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText(messageLabel), {
    target: { value: message },
  });
}

const submitButton = () =>
  screen.getByRole("button", { name: contactPage.submit });

/**
 * Records the links the form opens. jsdom cannot hand a mailto: link to an
 * email app, so the click is noted instead of followed.
 */
function recordOpenedLinks() {
  const opened: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    // The attribute as written: .href is the browser's re-encoding.
    opened.push(this.getAttribute("href")!);
  });
  return opened;
}

/** Who a mailto: link writes to, and the subject and body it carries. */
function mailtoParts(href: string) {
  const url = new URL(href);
  return {
    to: url.pathname,
    subject: url.searchParams.get("subject"),
    body: url.searchParams.get("body"),
  };
}

/** The prepared email as the Copy message button puts it on the clipboard. */
const copiedText = (subject: string) =>
  `To: ${contactPage.email}\nSubject: ${subject}\n\n${MESSAGE}\n\nAda Lovelace`;

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  vi.stubGlobal("isSecureContext", true);
}

describe("ContactPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("leads with the h1, word for word the live page's, and the founder-voice lead", () => {
    const { container } = render(<ContactPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    // The parity gate reads this text; the cutover (Phase 6) changed only
    // its markup: the display serif, with "talk." in the italic accent.
    expect(h1).toHaveTextContent("Building in fintech, AI or ops? Let’s talk.");
    expect(h1.className).toMatch(/t-display/);
    expect(h1.querySelector(".pf-page-hero__accent")).toHaveTextContent(
      "talk.",
    );
    expect(screen.getByText(contactPage.lead)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(
      /craft bold ideas|Drop us a line|3D & Motion/,
    );
  });

  it("puts every way to reach me in its own card", () => {
    render(<ContactPage />);
    const email = screen.getByRole("article", {
      name: contactPage.directLabel,
    });
    expect(
      within(email).getByRole("link", { name: contactPage.email }),
    ).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(
      within(email).getByRole("button", { name: contactPage.copyEmail }),
    ).toBeInTheDocument();
    // The Say hello popover's actions (plan step 6d), in the same words.
    expect(
      within(email).getByRole("link", {
        name: "Compose in Gmail (opens in a new tab)",
      }),
    ).toHaveAttribute("href", composeHref(contactPage.email));
    expect(
      within(email).getByRole("link", { name: "Open your mail app" }),
    ).toHaveAttribute("href", `mailto:${contactPage.email}`);
    // The Bangkok card is retired (umbrella input R14).
    expect(screen.queryByText(/Based in Bangkok/)).toBeNull();

    const elsewhere = screen.getByRole("article", {
      name: contactPage.elsewhereTitle,
    });
    expect(
      within(elsewhere)
        .getAllByRole("link")
        .map((a) => a.getAttribute("href")),
    ).toEqual([
      "https://x.com/fkj98",
      "https://www.linkedin.com/in/kunanonj",
      "https://github.com/KunanonJ",
      "https://t.me/fkj98",
      "https://farcaster.xyz/fronk98",
    ]);

    // "Say hello" on the page jumps to the form card.
    const form = screen.getByRole("article", { name: contactPage.cardTitle });
    expect(form).toHaveAttribute("id", contactPage.formId);
    for (const link of screen.getAllByRole("link", { name: /say hello/i }))
      expect(link).toHaveAttribute("href", `#${contactPage.formId}`);
  });

  it("copies the email address and says so", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ContactPage />);
    fireEvent.click(
      screen.getByRole("button", { name: contactPage.copyEmail }),
    );
    expect(
      await screen.findByRole("button", { name: contactPage.emailCopied }),
    ).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(contactPage.email);
  });

  it("exposes topic chips as toggle buttons, Hiring first", () => {
    render(<ContactPage />);
    const chip = screen.getByRole("button", { name: "Hiring" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    const chips = chip.parentElement!.querySelectorAll("button");
    expect(chips[0]).toBe(chip);
    expect(chips).toHaveLength(8);
  });

  it("readies the form for a recruiter who arrives through a hiring button", async () => {
    render(<ContactPage intent="hiring" />);
    const chip = screen.getByRole("button", { name: "Hiring" });
    await waitFor(() => expect(chip).toHaveAttribute("aria-pressed", "true"));
    // The question changes with the visitor; the general one is gone.
    expect(
      screen.getByLabelText(contactPage.hiringPlaceholder),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(contactPage.messagePlaceholder)).toBeNull();
    // Chosen for them, not locked: they can still take it off, and the
    // question follows the chip back to the general one.
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByLabelText(contactPage.messagePlaceholder),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(contactPage.hiringPlaceholder)).toBeNull();
  });

  it("asks about the role whenever Hiring is chosen, also by hand", () => {
    render(<ContactPage />);
    fireEvent.click(screen.getByRole("button", { name: "Hiring" }));
    expect(
      screen.getByLabelText(contactPage.hiringPlaceholder),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(contactPage.messagePlaceholder)).toBeNull();
  });

  it("only ever adds Hiring: a later general visit leaves the chip alone", async () => {
    const { rerender } = render(<ContactPage intent="hiring" />);
    const chip = screen.getByRole("button", { name: "Hiring" });
    await waitFor(() => expect(chip).toHaveAttribute("aria-pressed", "true"));
    // The same form, now under /contact: what the visitor sees pressed stays
    // pressed, and the question still matches it.
    rerender(<ContactPage />);
    expect(screen.getByRole("button", { name: "Hiring" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByLabelText(contactPage.hiringPlaceholder),
    ).toBeInTheDocument();
  });

  it("keeps the form ready for a recruiter who writes another message", async () => {
    const opened = recordOpenedLinks();
    render(<ContactPage intent="hiring" />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Hiring" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
    fill({ messageLabel: contactPage.hiringPlaceholder });
    fireEvent.click(submitButton());
    await screen.findByRole("status");
    expect(mailtoParts(opened[0]!).subject).toBe(
      "Hiring: Ada Lovelace via kunanonj.com",
    );

    fireEvent.click(
      screen.getByRole("button", { name: contactPage.writeAnother }),
    );
    // An empty form again, still a hiring one.
    expect(screen.getByRole("button", { name: "Hiring" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText(contactPage.hiringPlaceholder)).toHaveValue(
      "",
    );
  });

  it("leaves the general form alone without the hiring intent", () => {
    render(<ContactPage />);
    expect(screen.getByRole("button", { name: "Hiring" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByLabelText(contactPage.messagePlaceholder),
    ).toBeInTheDocument();
  });

  it("answers a recruiter's first questions in their own card", () => {
    render(<ContactPage />);
    const card = screen.getByRole("article", {
      name: contactPage.recruiterTitle,
    });
    expect(card).toHaveTextContent(
      "Open to Forward Deployed Engineer and AI engineering roles, based in Bangkok or remote.",
    );
    expect(card).toHaveTextContent("Bangkok time, GMT+7.");
    // The arrows are hidden from the link names since the cutover (design
    // spec 12 item 18).
    expect(within(card).getByRole("link", { name: "Résumé" })).toHaveAttribute(
      "href",
      "/resume",
    );
    const pdf = within(card).getByRole("link", { name: "Download PDF" });
    expect(pdf).toHaveAttribute("href", "/resume.pdf");
    expect(pdf).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    const linkedin = within(card).getByRole("link", {
      name: "LinkedIn (opens in a new tab)",
    });
    expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/kunanonj",
    );
    // LinkedIn leaves the site, as it does in the Elsewhere card.
    expect(linkedin).toHaveAttribute("target", "_blank");
    // Nothing the owner has not approved: no notice period, no visa status.
    expect(card).not.toHaveTextContent(/notice|visa|authori[sz]/i);
    // It shares its row with "Who should write", which comes first; the
    // browser test measures the row at 1440 px and the stack at 800 px.
    const who = screen.getByRole("article", { name: contactPage.whoTitle });
    expect(who.nextElementSibling).toBe(card);
    expect(card.parentElement).toHaveClass("pf-contact__row");
  });

  it("shows each problem under its field and focuses the first, opening nothing", async () => {
    const opened = recordOpenedLinks();
    render(<ContactPage />);
    fill({ name: "", message: "short" });
    fireEvent.click(submitButton());

    const name = screen.getByLabelText(contactPage.namePlaceholder);
    await waitFor(() => expect(name).toHaveAttribute("aria-invalid", "true"));
    expect(name).toHaveAccessibleDescription(contactMessages.invalidName);
    expect(
      screen.getByLabelText(contactPage.messagePlaceholder),
    ).toHaveAccessibleDescription(contactMessages.messageTooShort);
    expect(document.activeElement).toBe(name);
    expect(opened).toEqual([]);
    expect(screen.queryByRole("status")).toBeNull();

    // After a submit, each field rechecks as it changes.
    fireEvent.change(name, { target: { value: "Ada" } });
    await waitFor(() => expect(name).toHaveAttribute("aria-invalid", "false"));
    expect(screen.queryByText(contactMessages.invalidName)).toBeNull();
  });

  it("prepares the email and opens it in the visitor's email app, sending nothing itself", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const opened = recordOpenedLinks();
    render(<ContactPage />);
    // The button says where the message goes before it is pressed.
    expect(submitButton()).toHaveAccessibleDescription(contactPage.formNote);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Manut AI" }));
    fireEvent.click(submitButton());

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(contactPage.readyTitle);
    expect(status).toHaveTextContent(contactPage.email);
    expect(document.activeElement).toBe(status);
    expect(opened).toHaveLength(1);
    // The topics lead the subject so the owner can sort the inbox; the
    // body is the message signed with the name, in CRLF lines (RFC 6068).
    expect(mailtoParts(opened[0]!)).toEqual({
      to: contactPage.email,
      subject: "Manut AI: Ada Lovelace via kunanonj.com",
      body: `${MESSAGE}\r\n\r\nAda Lovelace`,
    });
    // "Open it again" is the same email, for a browser that opened nothing.
    expect(
      screen.getByRole("link", { name: contactPage.openAgain }),
    ).toHaveAttribute("href", opened[0]);
    expect(fetchMock).not.toHaveBeenCalled();

    // "Write another message" brings back an empty form, focus on the name.
    fireEvent.click(
      screen.getByRole("button", { name: contactPage.writeAnother }),
    );
    const name = screen.getByLabelText(contactPage.namePlaceholder);
    expect(name).toHaveValue("");
    await waitFor(() => expect(document.activeElement).toBe(name));
  });

  it("copies the prepared email for a visitor whose browser opened nothing", async () => {
    recordOpenedLinks();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ContactPage />);
    fill();
    fireEvent.click(submitButton());
    fireEvent.click(
      await screen.findByRole("button", { name: contactPage.copyMessage }),
    );
    expect(
      await screen.findByRole("button", { name: contactPage.messageCopied }),
    ).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(
      copiedText("Ada Lovelace via kunanonj.com"),
    );
  });

  it("shows the email to copy by hand when the clipboard refuses", async () => {
    recordOpenedLinks();
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<ContactPage />);
    fill();
    fireEvent.click(submitButton());
    fireEvent.click(
      await screen.findByRole("button", { name: contactPage.copyMessage }),
    );
    const text = await screen.findByRole("textbox", {
      name: contactPage.copyFailed,
    });
    expect(text).toHaveAttribute("readonly");
    const email = copiedText("Ada Lovelace via kunanonj.com");
    expect(text).toHaveValue(email);
    // Focused and selected: its label is read out, and one keypress copies.
    await waitFor(() => expect(document.activeElement).toBe(text));
    const area = text as HTMLTextAreaElement;
    expect([area.selectionStart, area.selectionEnd]).toEqual([0, email.length]);
    // The button never claims a copy that did not happen.
    const again = screen.getByRole("button", { name: contactPage.copyMessage });
    expect(again).toBeInTheDocument();

    // A second refusal hands the email back, selected again.
    again.focus();
    area.setSelectionRange(0, 0);
    fireEvent.click(again);
    await waitFor(() => expect(document.activeElement).toBe(text));
    expect([area.selectionStart, area.selectionEnd]).toEqual([0, email.length]);
  });

  it("asks for a copy first when the message is too long for an email link", async () => {
    const opened = recordOpenedLinks();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<ContactPage />);
    // Thai letters take 9 characters each in a link: 400 of them is over.
    const long = "สวัสดีครับ ".repeat(40).trim();
    fill({ message: long });
    fireEvent.click(submitButton());

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(contactPage.longTitle);
    expect(status).toHaveTextContent(contactPage.email);
    expect(document.activeElement).toBe(status);
    // Nothing opens on its own: a Windows browser would open nothing at all.
    expect(opened).toEqual([]);
    const open = screen.getByRole("link", { name: contactPage.openApp });
    const href = open.getAttribute("href")!;
    expect(href.length).toBeLessThanOrEqual(MAILTO_MAX);
    expect(mailtoParts(href)).toEqual({
      to: contactPage.email,
      subject: "Ada Lovelace via kunanonj.com",
      body: null,
    });

    fireEvent.click(
      screen.getByRole("button", { name: contactPage.copyMessage }),
    );
    await screen.findByRole("button", { name: contactPage.messageCopied });
    expect(writeText).toHaveBeenCalledWith(
      `To: ${contactPage.email}\nSubject: Ada Lovelace via kunanonj.com\n\n${long}\n\nAda Lovelace`,
    );
  });
});
