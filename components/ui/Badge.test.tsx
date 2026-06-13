import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders default sticker variant", () => {
    render(<Badge>Live</Badge>);
    expect(screen.getByText("Live")).toHaveClass("sticker");
  });

  it("renders outline variant", () => {
    render(<Badge variant="outline">About</Badge>);
    expect(screen.getByText("About")).toHaveClass("border-brutal");
  });
});
