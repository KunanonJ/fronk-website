import { createFileRoute } from "@tanstack/react-router";
import { withEdgeLifetime } from "@/src/lib/cache";
import { GET } from "@/src/server/text/agentSkillsIndex";

/**
 * The Agent Skills discovery index (src/server/text/agentSkillsIndex.ts).
 * Built from the committed skills snapshot, so it changes only on a deploy,
 * which empties the cache: a day at the edge, an hour in browsers.
 */
export const Route = createFileRoute("/.well-known/agent-skills/index.json")({
  server: {
    handlers: {
      GET: () =>
        withEdgeLifetime(
          GET(),
          "public, max-age=86400",
          "public, max-age=3600",
        ),
    },
  },
});
