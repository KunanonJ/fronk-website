import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GithubIcon, LinkedInIcon, XIcon } from "./brand-icons";

describe("brand-icons > given lucide v1 removed brand marks > then inline SVGs render", () => {
  it.each([
    ["GithubIcon", GithubIcon],
    ["LinkedInIcon", LinkedInIcon],
    ["XIcon", XIcon],
  ] as const)("renders %s as an accessible decorative svg", (_name, Icon) => {
    const { container } = render(<Icon className="h-4 w-4" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("h-4", "w-4");
    expect(svg?.querySelector("path")).not.toBeNull();
  });
});
