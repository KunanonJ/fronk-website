import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqList } from "@/components/profile/pages/FaqList";

const ITEMS = [
  { question: "First question?", answer: "First answer." },
  { question: "Second question?", answer: "Second answer." },
  { question: "Third question?", answer: "Third answer." },
] as const;

const details = (container: HTMLElement) => [
  ...container.querySelectorAll<HTMLDetailsElement>("details"),
];

describe("FaqList", () => {
  it("sets each question as a disclosure, the first open, every answer in the page", () => {
    const { container } = render(<FaqList items={ITEMS} />);
    const items = details(container);
    expect(items.map((item) => item.open)).toEqual([true, false, false]);
    ITEMS.forEach((item, i) => {
      expect(
        within(items[i]!).getByRole("heading", { level: 3 }),
      ).toHaveTextContent(item.question);
      expect(items[i]).toHaveTextContent(item.answer);
    });
    // No numbers unless asked for.
    expect(container.querySelector(".pf-faq__number")).toBeNull();
  });

  it("draws each question's number when numbered, hidden from screen readers", () => {
    const { container } = render(<FaqList items={ITEMS} numbered />);
    const numbers = [...container.querySelectorAll(".pf-faq__number")];
    expect(numbers.map((n) => n.textContent)).toEqual(["01", "02", "03"]);
    for (const n of numbers) expect(n).toHaveAttribute("aria-hidden", "true");
    // The heading's name is the question alone.
    expect(
      screen.getByRole("heading", { level: 3, name: "Second question?" }),
    ).toBeInTheDocument();
  });

  it("opens every answer to print, then closes only the ones printing opened", () => {
    const { container } = render(<FaqList items={ITEMS} />);
    const items = details(container);
    // A reader opened the third answer before printing.
    items[2]!.open = true;
    fireEvent(window, new Event("beforeprint"));
    expect(items.every((item) => item.open)).toBe(true);
    fireEvent(window, new Event("afterprint"));
    expect(items.map((item) => item.open)).toEqual([true, false, true]);
  });

  it("stops listening for printing once it is gone", () => {
    const { container, unmount } = render(<FaqList items={ITEMS} />);
    const items = details(container);
    unmount();
    fireEvent(window, new Event("beforeprint"));
    expect(items.map((item) => item.open)).toEqual([true, false, false]);
  });
});
