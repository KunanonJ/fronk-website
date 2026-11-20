/*
 * The Konami code (↑ ↑ ↓ ↓ ← → ← → B A), which starts the pixel party
 * (components/secrets/Secrets.tsx). A sequence, not a single-key shortcut
 * (WCAG 2.1.4); it never counts a key typed into a field, a select or
 * editable text, or one held with ⌘, Ctrl or Alt.
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

/** The code's length: `konamiStep` returns it when the code is complete. */
export const KONAMI_LENGTH = CODE.length;

const TYPING =
  'input,textarea,select,[contenteditable]:not([contenteditable="false"])';

/** How far into the code a visitor `at` keys in is after this key. */
export function konamiStep(at: number, event: KeyboardEvent): number {
  const { target } = event;
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    (target instanceof Element && target.closest(TYPING))
  ) {
    return 0;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (key === CODE[at]) return at + 1;
  // ↑ starts it again; a third ↑ still has two in a row.
  return key === CODE[0] ? (at === 2 ? 2 : 1) : 0;
}
