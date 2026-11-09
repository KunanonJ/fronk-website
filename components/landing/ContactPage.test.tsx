import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ContactPage from "./ContactPage";
import { contactMessages, contactPage } from "@/lib/content/contact";

const fetchMock = vi.fn();

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText(contactPage.namePlaceholder), {
    target: { value: "Ada Lovelace" },
  });
  fireEvent.change(screen.getByLabelText(contactPage.emailPlaceholder), {
    target: { value: "ada@example.com" },
  });
  fireEvent.change(screen.getByLabelText(contactPage.messagePlaceholder), {
    target: { value: "I'd like to talk about Manut AI for our dealership." },
  });
  fireEvent.click(screen.getByRole("button", { name: "Manut AI" }));
  fireEvent.click(screen.getByRole("button", { name: contactPage.submit }));
}

describe("ContactPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows founder-voice copy, not the old agency template", () => {
    const { container } = render(<ContactPage />);
    expect(container.textContent).toContain(contactPage.headlineLead);
    expect(container.textContent).not.toMatch(
      /craft bold ideas|Drop us a line|3D & Motion/,
    );
  });

  it("exposes topic chips as toggle buttons", () => {
    render(<ContactPage />);
    const chip = screen.getByRole("button", { name: "Hiring" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("posts the message and shows success only after the server confirms", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ ok: true, message: contactMessages.sent }),
        { status: 200 },
      ),
    );
    render(<ContactPage />);
    fillAndSubmit();

    expect(
      await screen.findByText(contactPage.successTitle),
    ).toBeInTheDocument();
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
  });

  it("keeps the visitor's text and offers email when sending fails", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, message: contactMessages.failed }),
        { status: 502 },
      ),
    );
    render(<ContactPage />);
    fillAndSubmit();

    expect(
      await screen.findByText(new RegExp(contactMessages.failed)),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(contactPage.successTitle),
    ).not.toBeInTheDocument();
    // Ember marks the failure, always beside the words.
    expect(document.querySelector("[aria-live] .bg-ember")).not.toBeNull();
    expect(screen.getByLabelText(contactPage.messagePlaceholder)).toHaveValue(
      "I'd like to talk about Manut AI for our dealership.",
    );
    const fallbacks = screen.getAllByRole("link", { name: contactPage.email });
    expect(fallbacks.length).toBeGreaterThanOrEqual(2);
    expect(fallbacks.at(-1)).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:/),
    );
  });

  it("treats a network error as a failure, not a success", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<ContactPage />);
    fillAndSubmit();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: contactPage.submit }),
      ).not.toBeDisabled(),
    );
    expect(
      screen.getByText(new RegExp(contactMessages.failed)),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(contactPage.successTitle),
    ).not.toBeInTheDocument();
  });
});
