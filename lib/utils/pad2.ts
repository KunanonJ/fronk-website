/** "01", "02": the canvas writes list indexes and counts with two digits. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
