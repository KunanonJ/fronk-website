import geistBold from "./fonts/Geist-Bold.ttf?inline";
import geistRegular from "./fonts/Geist-Regular.ttf?inline";

/*
 * The two Geist faces for OG images (satori). The Worker has no filesystem,
 * so the TTFs are bundled as data URLs and decoded once per isolate.
 */
function decode(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

let fonts:
  | { name: string; data: ArrayBuffer; weight: 400 | 800; style: "normal" }[]
  | null = null;

export function loadOgFonts() {
  fonts ??= [
    { name: "Geist", data: decode(geistRegular), weight: 400, style: "normal" },
    { name: "Geist", data: decode(geistBold), weight: 800, style: "normal" },
  ];
  return fonts;
}
