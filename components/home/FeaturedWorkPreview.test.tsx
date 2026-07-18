import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturedWorkPreview } from "./FeaturedWorkPreview";
import type { Venture } from "@/lib/content/ventures";

const VENTURES: Venture[] = [
  {
    slug: "gogocash",
    name: "GoGoCash",
    tagline: "Cashback",
    description: "Shopping cashback platform.",
    year: 2023,
    role: "Founder",
    status: "active",
    stack: ["Cashback"],
    url: "https://gogocash.co",
    urlLabel: "gogocash.co",
    metrics: [{ value: "1,000+", label: "Users" }],
    featured: true,
  },
  {
    slug: "manut",
    name: "Manut AI",
    tagline: "AI workspace",
    description: "Solo founder workspace.",
    year: 2025,
    role: "Founder",
    status: "active",
    stack: ["AI"],
    url: "https://manut.xyz",
    urlLabel: "manut.xyz",
    featured: true,
  },
];

describe("FeaturedWorkPreview > given real ventures", () => {
  it("renders the primary venture name and a secondary row", () => {
    render(<FeaturedWorkPreview ventures={VENTURES} />);
    expect(screen.getByRole("heading", { name: "GoGoCash" })).toBeInTheDocument();
    expect(screen.getByText("Manut AI")).toBeInTheDocument();
    expect(screen.getByText("1,000+")).toBeInTheDocument();
  });

  it("renders nothing when the list is empty", () => {
    const { container } = render(<FeaturedWorkPreview ventures={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
