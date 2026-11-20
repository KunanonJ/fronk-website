import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Secrets } from "@/components/profile/site/secrets/Secrets";
import { TRAITS_EVENT, type TraitNews } from "@/lib/brand/traitEvents";

/*
 * The shell's secrets (now-building-and-genz Phase 3): nothing on the page
 * until a secret is found; the Konami code from anywhere but a field starts
 * the pixel party; news of a trait brings the toast.
 */

const party = vi.hoisted(() => ({ startParty: vi.fn() }));
vi.mock("@/components/profile/site/secrets/pixelParty", () => party);
vi.mock("@/components/profile/site/secrets/TraitToast", () => ({
  default: ({ news, onClose }: { news: TraitNews; onClose: () => void }) => (
    <div data-testid="toast">
      {news.id}
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function type(target: Element, keys: readonly string[]) {
  for (const key of keys) fireEvent.keyDown(target, { key });
}

beforeEach(() => {
  party.startParty.mockClear();
});

describe("Secrets", () => {
  it("renders nothing on the server or at rest", () => {
    expect(renderToString(<Secrets />)).toBe("");
    const { container } = render(<Secrets />);
    expect(container).toBeEmptyDOMElement();
  });

  it("starts the pixel party on the Konami code", async () => {
    render(<Secrets />);
    type(document.body, KONAMI);
    await vi.waitFor(() => expect(party.startParty).toHaveBeenCalledTimes(1));
    // Again from the start.
    type(document.body, KONAMI);
    await vi.waitFor(() => expect(party.startParty).toHaveBeenCalledTimes(2));
  });

  it("ignores the code typed into a field", async () => {
    render(
      <>
        <input aria-label="field" />
        <Secrets />
      </>,
    );
    type(screen.getByRole("textbox", { name: "field" }), KONAMI);
    await new Promise((done) => setTimeout(done, 20));
    expect(party.startParty).not.toHaveBeenCalled();
  });

  it("shows the toast for news of a trait, and only for news", async () => {
    render(<Secrets />);
    act(() => {
      window.dispatchEvent(new CustomEvent(TRAITS_EVENT, { detail: null }));
    });
    expect(screen.queryByTestId("toast")).toBeNull();
    act(() => {
      window.dispatchEvent(
        new CustomEvent(TRAITS_EVENT, {
          detail: { id: "earring", isNew: true },
        }),
      );
    });
    expect(await screen.findByTestId("toast")).toHaveTextContent("earring");
    fireEvent.click(screen.getByRole("button", { name: "close" }));
    expect(screen.queryByTestId("toast")).toBeNull();
  });
});
