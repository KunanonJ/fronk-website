import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FAQ } from "./FAQ";

const ITEMS = [
  { question: "Who is Fronk?", answer: "Kunanon Jarat, a Bangkok founder." },
  { question: "What is GoGoCash?", answer: "A shopping-to-earn cashback platform." },
] as const;

describe("FAQ > renders the supplied questions and answers", () => {
  it("shows every question and its answer", () => {
    render(<FAQ items={ITEMS} />);
    for (const item of ITEMS) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }
  });

  it("renders nothing when there are no items (no empty section)", () => {
    const { container } = render(<FAQ items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
