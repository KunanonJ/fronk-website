import instrumentSerifItalic from "./fonts/InstrumentSerif-Italic.ttf?inline";
import instrumentSerif from "./fonts/InstrumentSerif-Regular.ttf?inline";
import onestMedium from "./fonts/Onest-Medium.ttf?inline";
import onestRegular from "./fonts/Onest-Regular.ttf?inline";

/*
 * The share cards' and icons' faces (satori): Instrument Serif for titles
 * and the monogram (its italic for the profile cards' accent line), Onest at
 * 400 and 500 for the rest, as the site sets them (design spec 3.1). Static TrueType cuts of the site's own latin woff2 files
 * (Onest instantiated at each weight; satori reads no variable fonts), under
 * the OFL beside them. The Worker has no filesystem, so they are bundled as
 * data URLs and decoded once per isolate.
 */
function decode(dataUrl: string): ArrayBuffer {
  const binary = atob(dataUrl.slice(dataUrl.indexOf(",") + 1));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

type OgFont = {
  name: "Instrument Serif" | "Onest";
  data: ArrayBuffer;
  weight: 400 | 500;
  style: "normal" | "italic";
};

let fonts: OgFont[] | null = null;

export function loadOgFonts(): OgFont[] {
  fonts ??= [
    {
      name: "Instrument Serif",
      data: decode(instrumentSerif),
      weight: 400,
      style: "normal",
    },
    {
      name: "Instrument Serif",
      data: decode(instrumentSerifItalic),
      weight: 400,
      style: "italic",
    },
    { name: "Onest", data: decode(onestRegular), weight: 400, style: "normal" },
    { name: "Onest", data: decode(onestMedium), weight: 500, style: "normal" },
  ];
  return fonts;
}
