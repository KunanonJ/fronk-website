import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NarrativeBlock } from "./NarrativeBlock";

describe("NarrativeBlock > Fronk founder-ops voice", () => {
  it("renders shoppers/founders beats and Binary Holdings closing", () => {
    render(<NarrativeBlock />);
    expect(screen.getByText("Shoppers")).toBeInTheDocument();
    expect(
      screen.getByText("Want cash back that actually pays."),
    ).toBeInTheDocument();
    expect(screen.getByText(/Binary Holdings/)).toBeInTheDocument();
    expect(screen.queryByText(/fog/i)).not.toBeInTheDocument();
  });
});
