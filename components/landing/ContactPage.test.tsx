import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import ContactPage from "./ContactPage";
import { contactMessages, contactPage } from "@/lib/content/contact";

const fetchMock = vi.fn();

const MESSAGE = "I'd like to talk about Manut AI for our dealership.";

function fill({
  name = "Ada Lovelace",
  email = "ada@example.com",
  message = MESSAGE,
  // The message field's label depends on whether Hiring is chosen.
  messageLabel = contactPage.messagePlaceholder as string,
} = {}) {
  fireEvent.change(screen.getByLabelText(contactPage.namePlaceholder), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText(contactPage.emailPlaceholder), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(messageLabel), {
    target: { value: message },
  });
}

const submitButton = () =>
  screen.getByRole("button", {
    name: new RegExp(`^(${contactPage.submit}|${contactPage.sending})$`),
  });

function fillAndSubmit() {
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Manut AI" }));
  fireEvent.click(submitButton());
}

function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("ContactPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("leads with the canvas h1 and the founder-voice lead", () => {
    const { container } = render(<ContactPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Building in fintech, AI or ops? Let’s talk.");
    expect(h1.className).toMatch(/kj-lines/);
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
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    vi.stubGlobal("isSecureContext", true);
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

  it("keeps the form ready for a recruiter who sends another message", async () => {
    respond(200, { ok: true, message: contactMessages.sent });
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
    const [, init] = fetchMock.mock.calls[0]!;
    expect(JSON.parse(init.body as string).topics).toEqual(["Hiring"]);

    fireEvent.click(
      screen.getByRole("button", { name: contactPage.sendAnother }),
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
    expect(
      within(card).getByRole("link", { name: "Résumé →" }),
    ).toHaveAttribute("href", "/resume");
    const pdf = within(card).getByRole("link", { name: "Download PDF →" });
    expect(pdf).toHaveAttribute("href", "/resume.pdf");
    expect(pdf).toHaveAttribute("download", "Kunanon-Jarat-Resume.pdf");
    expect(
      within(card).getByRole("link", { name: "LinkedIn →" }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/kunanonj");
    // Nothing the owner has not approved: no notice period, no visa status.
    expect(card).not.toHaveTextContent(/notice|visa|authori[sz]/i);
    // It shares its row with "Who should write": that card takes two of the
    // three columns and this one follows it.
    const who = screen.getByRole("article", { name: contactPage.whoTitle });
    expect(who.className).toMatch(/col-span-2/);
    expect(who.nextElementSibling).toBe(card);
    // LinkedIn leaves the site, as it does in the Elsewhere card.
    expect(
      within(card).getByRole("link", { name: "LinkedIn →" }),
    ).toHaveAttribute("target", "_blank");
  });

  it("shows each problem under its field and focuses the first, sending nothing", async () => {
    render(<ContactPage />);
    fill({ name: "", email: "nope", message: "short" });
    fireEvent.click(submitButton());

    const name = screen.getByLabelText(contactPage.namePlaceholder);
    await waitFor(() => expect(name).toHaveAttribute("aria-invalid", "true"));
    expect(name).toHaveAccessibleDescription(contactMessages.invalidName);
    expect(
      screen.getByLabelText(contactPage.emailPlaceholder),
    ).toHaveAccessibleDescription(contactMessages.invalidEmail);
    expect(
      screen.getByLabelText(contactPage.messagePlaceholder),
    ).toHaveAccessibleDescription(contactMessages.messageTooShort);
    expect(document.activeElement).toBe(name);
    expect(fetchMock).not.toHaveBeenCalled();

    // After a submit, each field rechecks as it changes.
    fireEvent.change(name, { target: { value: "Ada" } });
    await waitFor(() => expect(name).toHaveAttribute("aria-invalid", "false"));
    expect(screen.queryByText(contactMessages.invalidName)).toBeNull();
  });

  it("reads Sending... while the message is on its way", async () => {
    let finish: (r: Response) => void = () => {};
    fetchMock.mockReturnValue(new Promise<Response>((r) => (finish = r)));
    render(<ContactPage />);
    fillAndSubmit();

    const busy = await screen.findByRole("button", {
      name: contactPage.sending,
    });
    expect(busy).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(busy);
    expect(fetchMock).toHaveBeenCalledOnce();
    finish(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    expect(
      await screen.findByText(contactPage.successTitle),
    ).toBeInTheDocument();
  });

  it("posts the message and shows success only after the server confirms", async () => {
    respond(200, { ok: true, message: contactMessages.sent });
    render(<ContactPage />);
    fillAndSubmit();

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(contactPage.successTitle);
    expect(document.activeElement).toBe(status);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/contact");
    const body = JSON.parse(init.body as string);
    expect(body).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      topics: ["Manut AI"],
      company: "",
    });
    expect(typeof body.elapsedMs).toBe("number");

    // "Send another message" brings back an empty form, focus on the name.
    fireEvent.click(
      screen.getByRole("button", { name: contactPage.sendAnother }),
    );
    const name = screen.getByLabelText(contactPage.namePlaceholder);
    expect(name).toHaveValue("");
    await waitFor(() => expect(document.activeElement).toBe(name));
  });

  it("keeps the visitor's text and offers email when sending fails", async () => {
    respond(502, { ok: false, message: contactMessages.failed });
    render(<ContactPage />);
    fillAndSubmit();

    expect(
      await screen.findByText(new RegExp(contactMessages.failed)),
    ).toBeInTheDocument();
    expect(screen.queryByText(contactPage.successTitle)).toBeNull();
    // Ember marks the failure, always beside the words.
    expect(document.querySelector("[aria-live] .bg-ember")).not.toBeNull();
    expect(screen.getByLabelText(contactPage.messagePlaceholder)).toHaveValue(
      MESSAGE,
    );
    const fallbacks = screen.getAllByRole("link", { name: contactPage.email });
    expect(fallbacks.length).toBeGreaterThanOrEqual(2);
    expect(fallbacks.at(-1)).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:/),
    );
  });

  it.each([
    [503, contactMessages.notConfigured],
    [429, contactMessages.rateLimited],
    [403, contactMessages.botCheck],
    [413, contactMessages.tooLarge],
  ])(
    "shows the server's %i message with the email fallback",
    async (code, message) => {
      respond(code, { ok: false, message });
      render(<ContactPage />);
      fillAndSubmit();
      const notice = await screen.findByText(message, { exact: false });
      expect(notice).toHaveTextContent(contactPage.errorFallbackLead);
    },
  );

  it("treats a network error as a failure, not a success", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<ContactPage />);
    fillAndSubmit();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: contactPage.submit }),
      ).toHaveAttribute("aria-disabled", "false"),
    );
    expect(
      screen.getByText(new RegExp(contactMessages.failed)),
    ).toBeInTheDocument();
    expect(screen.queryByText(contactPage.successTitle)).toBeNull();
  });
});
