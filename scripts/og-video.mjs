#!/usr/bin/env node
/**
 * Home's og:video (lib/og/homeVideoFrames.ts): renders the frames from the
 * share card itself and encodes them with ffmpeg into
 * public/og/home-<sha8>.mp4, named by its content so a new video is a new
 * URL. lib/og/homeVideo.json records the file and the fingerprint of what it
 * was made from; Home's head reads the file's path from there.
 *
 *   pnpm og:video           render, encode and check the video (needs ffmpeg
 *                           and ffprobe on PATH; CI has neither)
 * Colour is checked where it is seen: ffmpeg's decode ignores the transfer
 * tag, and Apple's players (Messages) do not, so a wrong tag passes the
 * frame check here and shows lighter in Messages (UX review 21-11-26).
 *
 *   pnpm og:video --check   exit 1 when the committed video is stale: the
 *                           card, the pixel portrait, the timeline or the
 *                           encoder changed since it was made (no ffmpeg)
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { readWranglerVars } from "./wrangler-vars.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RECORD = path.join(root, "lib/og/homeVideo.json");
const OUT_DIR = path.join(root, "public/og");
const check = process.argv.includes("--check");

// The card prints the site's domain: render it as production serves it.
process.env.NEXT_PUBLIC_SITE_URL = readWranglerVars(
  path.join(root, "wrangler.jsonc"),
).NEXT_PUBLIC_SITE_URL;

const sha256 = (data) => createHash("sha256").update(data).digest("hex");

/** The frames module, through Vite (TypeScript, the `@/` alias, `?inline`). */
async function loadFrames() {
  const { module } = await runnerImport(
    path.join(root, "lib/og/homeVideoFrames.ts"),
    {
      configFile: false,
      root,
      logLevel: "error",
      resolve: { alias: [{ find: /^@\//, replacement: `${root}/` }] },
    },
  );
  return module;
}

function readRecord() {
  return existsSync(RECORD) ? JSON.parse(readFileSync(RECORD, "utf8")) : null;
}

/** What is wrong with the committed video, or an empty list. */
function staleness(record, fingerprint, maxBytes) {
  if (!record) return ["lib/og/homeVideo.json is missing"];
  const problems = [];
  const file = path.join(root, "public", record.src);
  if (!existsSync(file)) return [`${record.src} is missing from public/`];
  const bytes = readFileSync(file);
  if (sha256(bytes) !== record.sha256)
    problems.push(`${record.src} is not the file the record names`);
  if (!record.src.includes(record.sha256.slice(0, 8)))
    problems.push(`${record.src} is not named by its content`);
  if (bytes.length > maxBytes)
    problems.push(`${record.src} is ${bytes.length} bytes, over ${maxBytes}`);
  if (record.inputs !== fingerprint)
    problems.push(
      "the card, the pixel portrait, the timeline or the encoder changed since the video was made",
    );
  return problems;
}

function run(cmd, args, input) {
  const result = spawnSync(cmd, args, { input, maxBuffer: 1 << 30 });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${cmd} failed: ${result.stderr?.toString() ?? ""}`);
  return result.stdout;
}

/** Pipes every frame to ffmpeg as raw RGB and waits for the MP4. */
function encode(source, file) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        `${source.width}x${source.height}`,
        "-r",
        String(source.fps),
        "-i",
        "pipe:0",
        ...source.encoder,
        file,
      ],
      { stdio: ["pipe", "inherit", "inherit"] },
    );
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
    );
    (async () => {
      for (let i = 0; i < source.count; i += 1) {
        if (!ffmpeg.stdin.write(source.frame(i)))
          await new Promise((r) => ffmpeg.stdin.once("drain", r));
      }
      ffmpeg.stdin.end();
    })().catch(reject);
  });
}

/** Mean absolute difference, in levels of 255, between two rgb24 images. */
function meanDiff(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}

/** The encoded video read back: its streams, and its first and last frames. */
function verify(file, source) {
  const probe = JSON.parse(
    run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "stream=codec_type,codec_name,pix_fmt,width,height:format=duration",
      "-of",
      "json",
      file,
    ]).toString(),
  );
  const [video, ...others] = probe.streams;
  if (
    others.length > 0 ||
    video.codec_type !== "video" ||
    video.codec_name !== "h264" ||
    video.pix_fmt !== "yuv420p" ||
    video.width !== source.width ||
    video.height !== source.height
  )
    throw new Error(`unexpected streams: ${JSON.stringify(probe.streams)}`);
  const decode = (index) =>
    run("ffmpeg", [
      "-v",
      "error",
      "-i",
      file,
      "-vf",
      `select=eq(n\\,${index}),scale=in_color_matrix=bt709:in_range=tv,format=rgb24`,
      "-frames:v",
      "1",
      "-f",
      "rawvideo",
      "pipe:1",
    ]);
  const still = source.frame(0);
  const first = meanDiff(decode(0), still);
  const last = meanDiff(decode(source.count - 1), still);
  // H.264 at 4:2:0 loses some colour at sharp edges; the still is otherwise
  // kept. A frame this far from the still is a different picture.
  if (first > 2 || last > 2)
    throw new Error(`first or last frame is not the still: ${first}, ${last}`);
  return { duration: Number(probe.format.duration), first, last };
}

const frames = await loadFrames();
const source = await frames.homeVideoSource();
const record = readRecord();

if (check) {
  const problems = staleness(
    record,
    source.fingerprint,
    frames.HOME_VIDEO_MAX_BYTES,
  );
  if (problems.length > 0) {
    console.error(
      `[og:video] stale: ${problems.join("; ")}. Run pnpm og:video.`,
    );
    process.exit(1);
  }
  console.log(`[og:video] ${record.src} is current`);
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
const draft = path.join(OUT_DIR, ".home-draft.mp4");
try {
  await encode(source, draft);
  const checked = verify(draft, source);
  const bytes = readFileSync(draft);
  if (bytes.length > frames.HOME_VIDEO_MAX_BYTES)
    throw new Error(`${bytes.length} bytes, over the 2 MB limit`);
  const hash = sha256(bytes);
  const name = `home-${hash.slice(0, 8)}.mp4`;
  for (const old of readdirSync(OUT_DIR))
    if (/^home-[0-9a-f]{8}\.mp4$/.test(old) && old !== name)
      rmSync(path.join(OUT_DIR, old));
  writeFileSync(path.join(OUT_DIR, name), bytes);
  const next = {
    src: `/og/${name}`,
    bytes: bytes.length,
    sha256: hash,
    inputs: source.fingerprint,
    fps: source.fps,
    frames: source.count,
  };
  writeFileSync(RECORD, `${JSON.stringify(next, null, 2)}\n`);
  console.log(
    `[og:video] ${next.src}: ${bytes.length} bytes, ${checked.duration} s, first and last frames ${checked.first.toFixed(2)} and ${checked.last.toFixed(2)} levels from the still`,
  );
} finally {
  rmSync(draft, { force: true });
}
