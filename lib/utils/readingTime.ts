const WORDS_PER_MINUTE = 220;

export function readingTime(text: string): { minutes: number; words: number } {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
  return { minutes, words };
}

export function readingTimeFromBlocks(blocks: unknown): { minutes: number; words: number } {
  const text = extractText(blocks);
  return readingTime(text);
}

function extractText(node: unknown): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join(" ");
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (Array.isArray(obj.children)) return extractText(obj.children);
  }
  return "";
}
