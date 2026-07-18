import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThreeStepEngage } from "./ThreeStepEngage";

describe("ThreeStepEngage > how we start", () => {
  it("renders founder engage heading instead of SaaS setup copy", () => {
    render(<ThreeStepEngage />);
    expect(
      screen.getByRole("heading", { name: "How we start." }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Set up in three steps/i)).not.toBeInTheDocument();
    expect(screen.getByText("Share the problem")).toBeInTheDocument();
  });
});
