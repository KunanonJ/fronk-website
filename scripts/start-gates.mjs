#!/usr/bin/env node
/**
 * Gates for the TanStack Start build (tanstack-migration). Serves the built
 * Start app with `vite preview` (workerd) and checks the routes listed in
 * src/ported-routes.json ({ path, test?, seed?, intended? }: `test` is the
 * e2e route name, `seed: false` keeps 404/redirect probes out of the crawl
 * seeds, `intended` lists fields allowed to differ from the reference):
 *   1. parity diff against the Next reference crawl;
 *   2. smoke + axe (both themes), and with --visual the Linux baselines
 *      (run --visual inside the pinned Playwright image only).
 *
 *   pnpm build && node scripts/start-gates.mjs [--visual | --parity-only]
 */
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PORT = 4173;
// 127.0.0.1, not localhost: in the CI container Node and vite resolve
// localhost to different address families, so the probe was refused.
const BASE = `http://127.0.0.1:${PORT}`;
const REFERENCE =
  "process/features/tanstack-migration/references/next-parity_09-11-26.json";
const routes = JSON.parse(readFileSync("src/ported-routes.json", "utf8"));
const visual = process.argv.includes("--visual");
// CI runs smoke, axe and visual in their own jobs; --parity-only skips Playwright here.
const parityOnly = process.argv.includes("--parity-only");

// Run vite directly (no pnpm wrapper) in its own process group, and keep its
// output off our stdio: a surviving grandchild holding our stderr kept the
// run open after every gate had finished.
let previewLog = "";
const preview = spawn(
  "node_modules/.bin/vite",
  ["preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
  {
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  },
);
preview.stdout.on("data", (d) => (previewLog += d));
preview.stderr.on("data", (d) => (previewLog += d));
const stop = () => {
  try {
    process.kill(-preview.pid, "SIGTERM");
  } catch {
    // already gone
  }
};
process.on("exit", stop);

async function ready() {
  for (let i = 0; i < 120; i += 1) {
    // Our preview died (e.g. the port is taken): never test someone else's server.
    if (preview.exitCode !== null) break;
    try {
      const res = await fetch(`${BASE}/`, {
        signal: AbortSignal.timeout(3000),
      });
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.error(previewLog);
  throw new Error("preview did not start");
}

function run(cmd, args, env = {}) {
  console.log(`\n$ ${cmd} ${args.join(" ")}`);
  return (
    spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } })
      .status ?? 1
  );
}

let failed = 0;
try {
  await ready();
  const crawl = "/tmp/start-parity.json";
  failed += run("node", ["scripts/parity-crawl.mjs", BASE, crawl], {
    PARITY_SEEDS: routes
      .filter((r) => r.seed !== false)
      .map((r) => r.path)
      .join(","),
  })
    ? 1
    : 0;
  // Intended differences (e.g. lang="th" on Thai pages) are listed per route.
  const ignore = routes.flatMap((r) =>
    (r.intended ?? []).map((field) => `${r.path}:${field}`),
  );
  const diffArgs = [
    "scripts/parity-diff.mjs",
    REFERENCE,
    crawl,
    "--only",
    routes.map((r) => r.path).join(","),
  ];
  if (ignore.length) diffArgs.push("--ignore", ignore.join(","));
  failed += run("node", diffArgs) ? 1 : 0;
  const names = routes
    .filter((r) => r.test)
    .map((r) => r.test)
    .join("|");
  if (parityOnly) throw new Error("__parity_only__");
  const specs = [
    "smoke.spec.ts",
    "a11y.spec.ts",
    ...(visual ? ["visual.spec.ts"] : []),
  ];
  failed += run(
    "pnpm",
    [
      "exec",
      "playwright",
      "test",
      ...specs,
      "--project=desktop",
      "--project=mobile",
      "--grep",
      `(^| )(${names})( |$)`,
    ],
    // Reuse this preview instead of letting Playwright start a server.
    { PLAYWRIGHT_BASE_URL: BASE, CI: "" },
  )
    ? 1
    : 0;
} catch (error) {
  if (!(error instanceof Error && error.message === "__parity_only__"))
    throw error;
} finally {
  stop();
}
console.log(
  failed
    ? `\n[start-gates] ${failed} gate(s) failed`
    : "\n[start-gates] all gates passed",
);
process.exit(failed ? 1 : 0);
