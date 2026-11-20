import { describe, expect, it } from "vitest";
import { KONAMI_LENGTH, konamiStep } from "@/lib/secrets/konami";

/*
 * The Konami code (now-building-and-genz Phase 3): ↑ ↑ ↓ ↓ ← → ← → B A, in
 * order, from anywhere but a field; a wrong key starts again.
 */

const CODE = [
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

/** Presses `keys` on `target` (the body by default); where the code got to. */
function press(
  keys: readonly string[],
  target: EventTarget = document.body,
  init: KeyboardEventInit = {},
): number {
  let at = 0;
  for (const key of keys) {
    const event = new KeyboardEvent("keydown", { key, ...init });
    Object.defineProperty(event, "target", { value: target });
    at = konamiStep(at, event);
  }
  return at;
}

describe("the Konami code", () => {
  it("is ten keys, and completes in order", () => {
    expect(KONAMI_LENGTH).toBe(10);
    expect(press(CODE)).toBe(KONAMI_LENGTH);
  });

  it("takes B and A with Shift or Caps Lock too", () => {
    expect(press([...CODE.slice(0, 8), "B", "A"])).toBe(KONAMI_LENGTH);
  });

  it("starts again after a wrong key", () => {
    expect(press([...CODE.slice(0, 5), "x"])).toBe(0);
    expect(press([...CODE.slice(0, 5), "x", ...CODE])).toBe(KONAMI_LENGTH);
    // A wrong ↑ counts as a new start.
    expect(press([...CODE.slice(0, 4), "ArrowUp"])).toBe(1);
  });

  it("keeps two ↑ in a row when a third comes", () => {
    expect(press(["ArrowUp", "ArrowUp", "ArrowUp", ...CODE.slice(2)])).toBe(
      KONAMI_LENGTH,
    );
  });

  it("never counts a key typed into a field, a select or editable text", () => {
    for (const html of [
      "<input>",
      "<textarea></textarea>",
      "<select><option>a</option></select>",
      '<div contenteditable="true"><p>text</p></div>',
    ]) {
      document.body.innerHTML = html;
      const field =
        document.body.querySelector("p") ?? document.body.firstElementChild!;
      expect(press(CODE, field), html).toBe(0);
    }
    document.body.innerHTML = '<div contenteditable="false"><p>text</p></div>';
    expect(press(CODE, document.body.querySelector("p")!)).toBe(KONAMI_LENGTH);
    document.body.innerHTML = "";
  });

  it("never counts a key held with ⌘, Ctrl or Alt", () => {
    for (const modifier of ["metaKey", "ctrlKey", "altKey"] as const) {
      expect(press(CODE, document.body, { [modifier]: true })).toBe(0);
    }
  });
});
