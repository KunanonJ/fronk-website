import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingSiteFooter from "@/components/landing/LandingSiteFooter";
import { footerLibrary, footerWork, socials } from "@/lib/content/landing";

describe("LandingSiteFooter", () => {
  it("keeps the #contact anchor and the contact email", () => {
    const { container } = render(<LandingSiteFooter />);
    expect(container.querySelector("footer#contact")).not.toBeNull();
    expect(
      screen.getByRole("link", { name: /@/ }).getAttribute("href"),
    ).toMatch(/^mailto:/);
  });

  it("has Work, Library and Elsewhere columns with every link", () => {
    render(<LandingSiteFooter />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    for (const item of [...footerWork, ...footerLibrary, ...socials]) {
      expect(
        within(nav).getByRole("link", { name: item.label }),
      ).toHaveAttribute("href", item.href);
    }
    for (const label of ["Work", "Library", "Elsewhere"]) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }
  });

  it("gives every footer link at least a 32 px target, and hides the decorative wordmark", () => {
    const { container } = render(<LandingSiteFooter />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    for (const link of within(nav).getAllByRole("link")) {
      expect(link.className).toMatch(/min-h-8/);
      expect(link.className).toMatch(/min-w-8/);
    }
    const wordmark = [...container.querySelectorAll("p")].find(
      (p) => p.textContent === "Kunanon",
    );
    expect(wordmark).toHaveAttribute("aria-hidden", "true");
  });
});
