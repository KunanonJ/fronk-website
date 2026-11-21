import { OG_SIZE } from "@/lib/og/card";
import { src } from "@/lib/og/homeVideo.json";
import type { HeadMeta } from "@/lib/seo/metadataToHead";
import { siteUrl } from "@/lib/site";

/**
 * Home's og:video (owner, 21-11-26): its share card coming alive
 * (lib/og/homeVideoFrames.ts), at the og:image's size. `pnpm og:video` makes
 * the file and writes its content-named path into ./homeVideo.json; only the
 * path is read here, so the page carries the URL and nothing else.
 *
 * The tags Facebook's sharing guide names, with the file's absolute https
 * URL on the site, as og:image has. Messages plays a direct MPEG-4 link as
 * the preview (Apple TN3156), so a page that named this video would preview
 * as Home's card: Home only. Discord plays it too; the other apps keep
 * og:image, the video's first and last frame.
 */
const url = siteUrl(src);

export const HOME_OG_VIDEO_META: readonly HeadMeta[] = [
  { property: "og:video", content: url },
  { property: "og:video:secure_url", content: url },
  { property: "og:video:type", content: "video/mp4" },
  { property: "og:video:width", content: String(OG_SIZE.width) },
  { property: "og:video:height", content: String(OG_SIZE.height) },
];
