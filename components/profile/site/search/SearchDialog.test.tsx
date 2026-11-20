import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchDialog from "@/components/profile/site/search/SearchDialog";
import type { SearchEntry } from "@/lib/search/match";

/*
 * The search dialog's commands (now-building-and-genz Phase 3): "/" swaps
 * the results for a Commands group in the same combobox, Enter runs one,
 * some answer in the dialog (and its polite line), the hidden ones find the
 * Gold earring, and a plain query still searches.
 */

const navigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({
  useRouter: () => ({ navigate }),
}));
const party = vi.hoisted(() => ({ startParty: vi.fn() }));
vi.mock("@/components/profile/site/secrets/pixelParty", () => party);
const clipboard = vi.hoisted(() => ({ writeClipboard: vi.fn() }));
vi.mock("@/lib/utils/clipboard", () => clipboard);

const INDEX: SearchEntry[] = [
  { path: "/about", title: "About", kind: "page", summary: "Who he is" },
  {
    path: "/portfolio/tbh-intranet",
    title: "TBH intranet",
    kind: "case",
    summary: "An internal platform",
  },
  {
    path: "/ventures/gogocash",
    title: "GoGoCash",
    kind: "case",
    summary: "Cashback",
  },
];

beforeEach(() => {
  localStorage.clear();
  navigate.mockClear();
  party.startParty.mockClear();
  clipboard.writeClipboard.mockReset();
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(INDEX))),
  );
  // jsdom has no modal dialogs: open and close as the browser would.
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  Element.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openDialog() {
  const onClose = vi.fn();
  render(<SearchDialog onClose={onClose} />);
  const field = screen.getByRole("combobox", { name: "Search the site" });
  // The index has loaded once its count is said.
  await screen.findByText(/results?$/);
  return { field, onClose };
}

function typeIn(field: HTMLElement, value: string) {
  fireEvent.change(field, { target: { value } });
}

const live = () => document.querySelector('[aria-live="polite"]')!;

describe("SearchDialog, commands", () => {
  it("lists the commands in their own group for a slash, and says how many", async () => {
    const { field } = await openDialog();
    typeIn(field, "/");
    const group = screen.getByRole("group", { name: "Commands" });
    const options = Array.from(group.querySelectorAll('[role="option"]'));
    expect(
      options.map((o) => o.querySelector(".pf-search__title")!.textContent),
    ).toEqual([
      "/party",
      "/theme light",
      "/theme dark",
      "/copy email",
      "/random",
      "/traits",
      "/resume",
      "/contact",
      "/shortcuts",
    ]);
    expect(field).toHaveAttribute("aria-expanded", "true");
    expect(field).toHaveAttribute("aria-activedescendant", options[0]!.id);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(live()).toHaveTextContent("9 commands");
    // The arrows move through them, as through results.
    fireEvent.keyDown(field, { key: "ArrowDown" });
    expect(field).toHaveAttribute("aria-activedescendant", options[1]!.id);
    // Typing filters; nothing matching says so.
    typeIn(field, "/zzz");
    expect(
      screen.getByText("No command matches “/zzz”. Type / for the list."),
    ).toBeInTheDocument();
    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("answers sudo hire kunanon, and finds the Gold earring", async () => {
    const { field } = await openDialog();
    typeIn(field, "sudo hire kunanon");
    expect(screen.getByRole("group", { name: "Commands" })).toHaveTextContent(
      "sudo hire kunanon",
    );
    fireEvent.keyDown(field, { key: "Enter" });
    const answer =
      "Permission denied: currently building GoGoCash and Manut AI. Try /contact.";
    expect(document.querySelector(".pf-search__answer")).toHaveTextContent(
      answer,
    );
    expect(live()).toHaveTextContent(answer);
    expect(JSON.parse(localStorage.getItem("pf-portrait-found")!)).toEqual([
      "earring",
    ]);
  });

  it("answers gm", async () => {
    const { field } = await openDialog();
    typeIn(field, "gm");
    fireEvent.keyDown(field, { key: "Enter" });
    expect(live()).toHaveTextContent("gm. Bangkok says hi.");
  });

  it("shows the keyboard shortcuts, the party's as a hint", async () => {
    const { field } = await openDialog();
    typeIn(field, "/shortcuts");
    fireEvent.keyDown(field, { key: "Enter" });
    const answer = document.querySelector(".pf-search__answer")!;
    expect(answer).toHaveTextContent("Keyboard shortcuts");
    expect(answer).toHaveTextContent("⌘K or Ctrl K");
    expect(answer).toHaveTextContent("A certain famous code");
    expect(live()).toHaveTextContent(/^Keyboard shortcuts: /);
  });

  it("copies the email address and says so", async () => {
    clipboard.writeClipboard.mockResolvedValue(true);
    const { field } = await openDialog();
    typeIn(field, "/copy");
    fireEvent.keyDown(field, { key: "Enter" });
    await vi.waitFor(() =>
      expect(document.querySelector(".pf-search__answer")).toHaveTextContent(
        "Copied fronk.kunanon@gmail.com.",
      ),
    );
    expect(live()).toHaveTextContent("Copied fronk.kunanon@gmail.com.");
    expect(clipboard.writeClipboard).toHaveBeenCalledWith(
      "fronk.kunanon@gmail.com",
    );
  });

  it("closes and throws the party", async () => {
    const { field, onClose } = await openDialog();
    typeIn(field, "/party");
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onClose).toHaveBeenCalled();
    await vi.waitFor(() => expect(party.startParty).toHaveBeenCalledTimes(1));
  });

  it("goes to the résumé, Contact, the traits and a random case", async () => {
    const { field } = await openDialog();
    for (const [query, to] of [
      ["/resume", { to: "/resume" }],
      ["/contact", { to: "/contact" }],
      ["/traits", { to: "/about", hash: "portrait" }],
    ] as const) {
      typeIn(field, query);
      fireEvent.keyDown(field, { key: "Enter" });
      expect(navigate).toHaveBeenLastCalledWith(expect.objectContaining(to));
    }
    typeIn(field, "/random");
    fireEvent.keyDown(field, { key: "Enter" });
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenLastCalledWith(
        expect.objectContaining({
          to: expect.stringMatching(/^\/(portfolio|ventures)\//),
        }),
      ),
    );
  });

  it("switches the theme with the nav's toggle", async () => {
    const toggle = document.createElement("button");
    toggle.className = "pf-theme-toggle";
    const pressed = vi.fn();
    toggle.addEventListener("click", pressed);
    document.body.append(toggle);
    const { field } = await openDialog();
    typeIn(field, "/theme light");
    fireEvent.keyDown(field, { key: "Enter" });
    // Already light: nothing to switch.
    expect(pressed).not.toHaveBeenCalled();
    typeIn(field, "/theme dark");
    fireEvent.keyDown(field, { key: "Enter" });
    expect(pressed).toHaveBeenCalledTimes(1);
    toggle.remove();
  });

  it("still searches a plain query, with the hint for commands", async () => {
    const { field } = await openDialog();
    typeIn(field, "gogo");
    expect(
      screen.getByRole("group", { name: "Case studies" }),
    ).toHaveTextContent("GoGoCash");
    act(() => {
      fireEvent.keyDown(field, { key: "Enter" });
    });
    expect(navigate).toHaveBeenLastCalledWith(
      expect.objectContaining({ to: "/ventures/gogocash" }),
    );
    expect(document.querySelector(".pf-search__foot")).toHaveTextContent(
      "Type / for commands",
    );
  });
});
