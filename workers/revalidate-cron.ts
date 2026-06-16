export interface RevalidateCronEnv {
  CRON_ENDPOINT_URL?: string;
  CRON_SECRET?: string;
}

export interface RevalidateResult {
  ok: boolean;
  status: number;
  error?: "missing_config" | "invalid_endpoint" | "fetch_failed";
}

type Fetcher = typeof fetch;

interface ScheduledControllerLike {
  cron?: string;
  scheduledTime?: number;
}

interface ExecutionContextLike {
  waitUntil(promise: Promise<unknown>): void;
}

function endpointFromEnv(env: RevalidateCronEnv): string | null {
  const endpoint = env.CRON_ENDPOINT_URL?.trim();
  if (!endpoint) return null;

  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export async function triggerRevalidation(
  env: RevalidateCronEnv,
  fetcher: Fetcher = fetch,
): Promise<RevalidateResult> {
  const endpoint = endpointFromEnv(env);
  const secret = env.CRON_SECRET?.trim();

  if (!endpoint || !secret) {
    return { ok: false, status: 0, error: "missing_config" };
  }

  try {
    const response = await fetcher(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, status: 0, error: "fetch_failed" };
  }
}

const revalidateCronWorker = {
  async scheduled(
    _controller: ScheduledControllerLike,
    env: RevalidateCronEnv,
    ctx: ExecutionContextLike,
  ) {
    ctx.waitUntil(
      triggerRevalidation(env).then((result) => {
        if (!result.ok) {
          console.error("cron revalidation failed", {
            status: result.status,
            error: result.error,
          });
        }
      }),
    );
  },

  fetch() {
    return Response.json({ ok: true, worker: "fronk-website-revalidate-cron" });
  },
};

export default revalidateCronWorker;
