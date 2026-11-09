/*
 * Cloudflare Turnstile, loaded only when a visitor submits a form and only
 * when a site key is configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY). Invisible
 * unless Cloudflare decides it needs an interaction, so nothing loads or
 * shows on page view.
 */

type Turnstile = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  execute: (container: HTMLElement) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptLoad: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptLoad ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing")));
    script.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(script);
  });
  return scriptLoad;
}

/** A one-time token (valid 300 s), or null if the check failed or timed out. */
export async function getTurnstileToken(container: HTMLElement, siteKey: string, timeoutMs = 20_000): Promise<string | null> {
  try {
    const turnstile = await loadTurnstile();
    return await new Promise<string | null>((resolve) => {
      let widgetId = "";
      const done = (token: string | null) => {
        clearTimeout(timer);
        if (widgetId) turnstile.remove(widgetId);
        resolve(token);
      };
      const timer = setTimeout(() => done(null), timeoutMs);
      widgetId = turnstile.render(container, {
        sitekey: siteKey,
        execution: "execute",
        appearance: "interaction-only",
        callback: (token: string) => done(token),
        "error-callback": () => done(null),
        "expired-callback": () => done(null),
      });
      turnstile.execute(container);
    });
  } catch {
    return null;
  }
}
