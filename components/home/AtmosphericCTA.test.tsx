import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AtmosphericCTA } from "./AtmosphericCTA";

describe("AtmosphericCTA > Bangkok close", () => {
  it("defaults to Building from Bangkok without fog metaphors", () => {
    render(<AtmosphericCTA />);
    expect(
      screen.getByRole("heading", { name: "Building from Bangkok." }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.queryByText(/fog/i)).not.toBeInTheDocument();
  });
});
