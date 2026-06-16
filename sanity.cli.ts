import { defineCliConfig } from "sanity/cli";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: {
    appId: "n3jbywdwz1dpo3ihh6cv1wtm",
  },
  project: { basePath: "/studio" },
});
