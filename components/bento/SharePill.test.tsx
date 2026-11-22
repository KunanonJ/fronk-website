import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChromeProvider } from "@/components/bento/ChromeContext";
import SharePill from "@/components/bento/SharePill";

/*
 * The hero Share pill is a ghost pill of its row's size (UX hunt 22-11-26):
 * 44 px with 16 px text beside the hero pills, 52 px beside a case page's
 * link out. It was a 56 px pill of 17 px semibold text of its own.
 */

function share(size?: "hero" | "lg") {
  render(
    <ChromeProvider>
      <SharePill size={size} />
    </ChromeProvider>,
  );
  return screen.getByRole("button", { name: "Share" });
}

describe("SharePill", () => {
  it("is a ghost hero pill by default, the size of the hero pills beside it", () => {
    const pill = share();
    expect(pill).toHaveClass("ds-pill", "ds-pill--ghost", "ds-pill--hero");
    expect(pill).not.toHaveClass("ds-pill--lg");
    // Round on phones at the pill's own 44 px, the label kept for screen
    // readers.
    expect(pill).toHaveClass("max-sm:w-11", "max-sm:px-0");
    expect(screen.getByText("Share")).toHaveClass("max-sm:sr-only");
  });

  it("takes the case pages' 52 px size beside their link out", () => {
    const pill = share("lg");
    expect(pill).toHaveClass("ds-pill", "ds-pill--ghost", "ds-pill--lg");
    expect(pill).not.toHaveClass("ds-pill--hero");
    expect(pill).toHaveClass("max-sm:w-13");
  });

  it("drops the old 56 px pill's own height and type", () => {
    const pill = share();
    for (const old of ["h-14", "text-[17px]", "font-semibold", "max-sm:w-14"]) {
      expect(pill).not.toHaveClass(old);
    }
  });
});
