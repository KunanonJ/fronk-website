import type { CSSProperties, ReactNode } from "react";

/*
 * Thai words a line must not split (UX hunt 22-11-26). Thai runs its words
 * together and a browser breaks it with a dictionary, which splits compounds
 * and borrowed words into the parts it knows: "ลง|ทะเบียน", "สตาร์ท|อัพ",
 * and inside a syllable "สต็|อก" or "ฟิน|เท|ค". Each word listed here is
 * drawn in a span that does not wrap. Only the drawing changes: the text, and
 * so the JSON-LD, the Markdown pages and llms.txt, stay as written. A word
 * joiner (U+2060) between the parts failed in Firefox when the hunt tried
 * it, and would change the text, so it is spans. The words are compounds
 * and borrowed words of the Thai hubs (lib/content/topics/pillars.ts) that
 * the dictionary splits.
 *
 * Its own module, not keepWhole.ts: that one is in every page's first load
 * (the nav uses it), and only the Thai hubs need these.
 */
const THAI_WORDS = [
  "การเปลี่ยนผ่าน",
  "กระจัดกระจาย",
  "ลงทะเบียน",
  "สตาร์ทอัพ",
  "ตัดสินใจ",
  "สต็อก",
  "แชทบอท",
  "ฟินเทค",
  "เรซูเม่",
  "พรีเซนต์",
  "ช้อปปิ้ง",
  "แคปชัน",
  "เครื่องมือ",
  "ยานยนต์",
  "ผู้ก่อตั้ง",
  "ผลิตภัณฑ์",
  "ดำเนินการ",
] as const;

const THAI_WORD = new RegExp(`(${THAI_WORDS.join("|")})`);

const NOWRAP: CSSProperties = { whiteSpace: "nowrap" };

/**
 * `text` with each listed Thai word in a span that does not wrap; `text`
 * itself when it has none of them.
 */
export function keepThaiWordsWhole(text: string): ReactNode {
  // A capturing split: the words are at the odd places.
  const parts = text.split(THAI_WORD);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={index} style={NOWRAP}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}
