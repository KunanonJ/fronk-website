import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo > KunanonJ brand wordmark", () => {
  it("renders the KunanonJ wordmark", () => {
    render(<Logo />);
    expect(screen.getByText("KunanonJ")).toBeInTheDocument();
  });

  it("does not render the legacy terminal cursor", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("[data-cursor]")).toBeNull();
  });
});
