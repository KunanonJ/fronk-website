import geistBold from "@/lib/og/fonts/Geist-Bold.ttf?inline";
import geistRegular from "@/lib/og/fonts/Geist-Regular.ttf?inline";

/*
 * lib/og/fonts in the Start build (tanstack-migration). The Worker has no
 * filesystem, so the two Geist TTFs are bundled as data URLs and decoded once.
 */
function decode(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

let fonts: { name: string; data: ArrayBuffer; weight: 400 | 800; style: "normal" }[] | null = null;

export function loadOgFonts() {
  fonts ??= [
    { name: "Geist", data: decode(geistRegular), weight: 400, style: "normal" },
    { name: "Geist", data: decode(geistBold), weight: 800, style: "normal" },
  ];
  return fonts;
}
