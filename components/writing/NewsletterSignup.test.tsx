import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterSignup } from "./NewsletterSignup";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NewsletterSignup", () => {
  it("renders an email field and a subscribe button", () => {
    render(<NewsletterSignup />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /subscribe/i }),
    ).toBeInTheDocument();
  });

  it("posts to /api/subscribe and shows the success message", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, message: "You're in." }), {
        status: 200,
      }),
    );
    render(<NewsletterSignup />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "a@b.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(screen.getByText("You're in.")).toBeInTheDocument(),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/subscribe",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("surfaces the API error message on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ ok: false, message: "Enter a valid email address." }),
        { status: 400 },
      ),
    );
    render(<NewsletterSignup />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "bad" },
    });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(
        screen.getByText("Enter a valid email address."),
      ).toBeInTheDocument(),
    );
  });
});
