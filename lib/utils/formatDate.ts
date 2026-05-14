export function formatDate(input: string | Date, locale = "en-US"): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`formatDate: invalid date input "${String(input)}"`);
  }
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isoDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toISOString();
}
