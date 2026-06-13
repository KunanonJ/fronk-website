#!/usr/bin/env node
/**
 * Configure Railway cron revalidation for fronk-website.
 *
 * Requires: railway login
 * Usage: node scripts/setup-railway-cron.mjs
 */

import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const projectPath = process.cwd();
const siteUrl = (process.env.SITE_URL ?? "https://kunanonj.com").replace(
  /\/$/,
  "",
);
const cronEndpoint = `${siteUrl}/api/cron/revalidate`;
const cronSecret =
  process.env.CRON_SECRET ?? randomBytes(32).toString("hex");
const cronServiceName = process.env.CRON_SERVICE_NAME ?? "cron-revalidate";
const repo = process.env.RAILWAY_REPO ?? "KunanonJ/fronk-website";

function sh(args) {
  return execSync(`railway ${args}`, {
    cwd: projectPath,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function shJson(args) {
  const out = sh(args);
  return JSON.parse(out);
}

function linkedProject() {
  const configPath = join(homedir(), ".railway", "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const linked = config.projects?.[projectPath];
  if (!linked?.project || !linked?.environment) {
    throw new Error(
      'Run `railway link` in this repo and select the fronk-website project.',
    );
  }
  return linked;
}

function findWebService(services) {
  return (
    services.find((service) => service.name === "fronk-website") ??
    services.find((service) => !service.name?.includes("cron")) ??
    services[0]
  );
}

function findCronService(services) {
  return services.find(
    (service) =>
      service.name === cronServiceName || /cron/i.test(service.name ?? ""),
  );
}

function main() {
  console.log("Railway cron setup");
  console.log(`Site: ${siteUrl}`);

  sh("whoami");

  const { project: projectId, environment: environmentId } = linkedProject();
  const services = shJson(
    `service list --project ${projectId} --environment ${environmentId} --json`,
  );

  const webService = findWebService(services);
  if (!webService?.id) {
    throw new Error("Could not find web service in project");
  }

  console.log(`Web service: ${webService.name} (${webService.id})`);
  sh(
    `variable set CRON_SECRET=${cronSecret} --service ${webService.id} --project ${projectId} --environment ${environmentId}`,
  );

  let cronService = findCronService(services);
  if (!cronService) {
    console.log(`Creating service ${cronServiceName}`);
    cronService = shJson(
      `add --repo ${repo} --service ${cronServiceName} --project ${projectId} --environment ${environmentId} --json`,
    );
  } else {
    console.log(`Cron service exists: ${cronService.name} (${cronService.id})`);
  }

  const cronServiceId = cronService.id ?? cronService.serviceId;
  if (!cronServiceId) {
    throw new Error(`Unexpected create-service response: ${JSON.stringify(cronService)}`);
  }

  sh(
    `variable set NIXPACKS_CONFIG_FILE=nixpacks.cron.toml CRON_SECRET=${cronSecret} CRON_ENDPOINT_URL=${cronEndpoint} --service ${cronServiceId} --project ${projectId} --environment ${environmentId}`,
  );

  console.log("\nConfigure these in Railway dashboard for the cron service:");
  console.log("- Settings → Config file path: railway.cron.toml");
  console.log("- Settings → Cron schedule: 0 * * * *");
  console.log("- Deploy → Start command: node scripts/cron-revalidate.mjs");
  console.log("\nDone. CRON_SECRET was set on both services.");
  console.log(`Test: curl -H "Authorization: Bearer <secret>" ${cronEndpoint}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`setup failed: ${message}`);
  if (error && typeof error === "object" && "stderr" in error) {
    console.error(String(error.stderr));
  }
  process.exit(1);
}
