import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pill, SwapArrow, pillClass } from "@/components/ds/Pill";
import {
  Badge,
  Chip,
  EyebrowRow,
  PixelMark,
  StatusDot,
} from "@/components/ds/labels";
import { Tile, Wrap } from "@/components/ds/layout";
import { TextLink } from "@/components/ds/TextLink";
import { MotionToggle } from "@/components/ds/MotionToggle";
import { DitherField } from "@/components/ds/DitherField";

/** matchMedia that reports reduced motion (or not) for the hooks under test. */
function stubReducedMotion(reduce: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes("reduce"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Pill", () => {
  it("is a link named by its label, with the swap arrows hidden", () => {
    const { container } = render(
      <Pill href="/contact" size="hero" arrow="swap">
        Contact me
      </Pill>,
    );
    const link = screen.getByRole("link", { name: "Contact me" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link).toHaveClass("ds-pill", "ds-pill--hero");
    expect(container.querySelector(".ds-swap")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("is a button when it acts", () => {
    const onClick = vi.fn();
    render(
      <Pill variant="ghost" size="sm" onClick={onClick}>
        Read the story
      </Pill>,
    );
    const button = screen.getByRole("button", { name: "Read the story" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("ds-pill--ghost", "ds-pill--sm");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps a round pill's label as its name and hides the icon", () => {
    const { container } = render(
      <Pill round icon={<svg data-testid="icon" />}>
        Copy email
      </Pill>,
    );
    expect(screen.getByRole("button", { name: "Copy email" })).toHaveClass(
      "ds-pill--round",
    );
    expect(container.querySelector(".ds-pill__icon")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("opens off-site links in a new tab and says so", () => {
    render(
      <Pill href="https://github.com" external>
        GitHub
      </Pill>,
    );
    const link = screen.getByRole("link", {
      name: "GitHub (opens in a new tab)",
    });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener");
  });

  it("shares its classes with pills drawn inside card links", () => {
    expect(pillClass({ variant: "ghost", size: "sm" })).toBe(
      "ds-pill ds-pill--ghost ds-pill--sm",
    );
    const { container } = render(<SwapArrow />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });
});

describe("labels", () => {
  it("renders chips, the illustration chip and the badge as text", () => {
    render(
      <>
        <Chip>GoGoCash and Manut AI</Chip>
        <Chip kind="illustration">Illustration</Chip>
        <Badge>Currently building</Badge>
      </>,
    );
    expect(screen.getByText("GoGoCash and Manut AI")).toHaveClass("ds-chip");
    expect(screen.getByText("Illustration")).toHaveClass(
      "ds-chip--illustration",
    );
    expect(screen.getByText("Currently building")).toHaveClass("ds-badge");
  });

  it("sets eyebrows as mono labels, as a heading when asked", () => {
    render(
      <EyebrowRow as="h2" centred id="notes">
        Notes
      </EyebrowRow>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Notes" });
    expect(heading).toHaveClass("ds-eyebrow", "t-meta", "ds-eyebrow--centred");
  });

  it("keeps dots and pixel marks out of the accessibility tree", () => {
    const { container } = render(
      <>
        <StatusDot />
        <StatusDot plain />
        <PixelMark />
        <PixelMark kind="bullet" />
        <PixelMark kind="word" />
      </>,
    );
    const marks = container.querySelectorAll("span");
    expect(marks).toHaveLength(5);
    for (const mark of marks)
      expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".ds-status-dot--ping")).not.toBeNull();
    expect(container.querySelector(".ds-dot")).not.toBeNull();
  });
});

describe("layout", () => {
  it("names a tile by its heading and applies its tone", () => {
    render(
      <Tile as="section" tone="stats" labelledBy="stats-title">
        <h3 id="stats-title">GoGoCash</h3>
      </Tile>,
    );
    expect(screen.getByRole("region", { name: "GoGoCash" })).toHaveClass(
      "ds-tile",
      "ds-tile--stats",
    );
  });

  it("wraps content in the page column", () => {
    const { container } = render(<Wrap as="section">x</Wrap>);
    expect(container.firstElementChild).toHaveClass("ds-wrap");
  });
});

describe("TextLink", () => {
  it("names the link by its words, not its arrow", () => {
    render(<TextLink href="/portfolio">All work</TextLink>);
    expect(screen.getByRole("link", { name: "All work" })).toHaveClass(
      "ds-text-link",
    );
  });

  it("puts a back link's arrow first", () => {
    render(
      <TextLink href="/portfolio" arrow="left">
        All work
      </TextLink>,
    );
    const link = screen.getByRole("link", { name: "All work" });
    expect(link).toHaveClass("ds-back");
    expect(link.firstElementChild).toHaveTextContent("←");
  });

  it("underlines prose links and drops the arrow", () => {
    render(
      <TextLink href="/resume" tone="prose">
        full résumé
      </TextLink>,
    );
    const link = screen.getByRole("link", { name: "full résumé" });
    expect(link).toHaveClass("ds-prose-link");
    expect(link.querySelector(".ds-text-link__arrow")).toBeNull();
  });
});

describe("MotionToggle", () => {
  it("names the action a press will take, without aria-pressed", () => {
    stubReducedMotion(false);
    const onToggle = vi.fn();
    render(<MotionToggle playing onToggle={onToggle} />);
    const button = screen.getByRole("button", { name: "Pause motion" });
    expect(button).not.toHaveAttribute("aria-pressed");
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it("offers play once paused", () => {
    stubReducedMotion(false);
    render(<MotionToggle playing={false} onToggle={() => {}} />);
    expect(screen.getByRole("button", { name: "Play motion" })).toBeVisible();
  });

  it("does not render under reduced motion, where nothing moves", () => {
    stubReducedMotion(true);
    const { container } = render(<MotionToggle playing onToggle={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("DitherField", () => {
  it("is a decorative canvas", () => {
    const { container } = render(<DitherField />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("ds-dither");
  });
});
