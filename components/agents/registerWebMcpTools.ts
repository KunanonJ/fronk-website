import { fillContactDraft } from "@/lib/agents/contactDraft";
import {
  siteTools,
  type SiteTool,
  type ToolDeps,
  type ToolResult,
} from "@/lib/agents/webmcp";

/*
 * The registration half of components/agents/WebMcpTools.tsx, in the tools'
 * own chunk: only a browser with WebMCP loads it, so the entry chunk every
 * page loads carries just the check for it.
 */

/** The browser's WebMCP surface (`document.modelContext`, or Chrome's earlier `navigator.modelContext`). */
export interface ModelContext {
  registerTool(
    tool: object,
    options?: { signal?: AbortSignal },
  ): Promise<unknown> | unknown;
}

/** What the tools do through the page: the router and the theme. */
export interface PageActions extends Pick<ToolDeps, "navigate" | "setTheme"> {
  /** Opens the contact page. */
  openContact: () => Promise<void>;
}

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path, {
    headers: { accept: "text/markdown, text/plain, application/json" },
  });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.text();
}

/**
 * Registers the site's tools with `context` until `signal` aborts. Returns
 * what else undoes them: the unregister() of Chrome's preview handles.
 */
export function registerWebMcpTools(
  context: ModelContext,
  page: PageActions,
  signal: AbortSignal,
): () => void {
  const undo: (() => void)[] = [];

  const register = (tool: SiteTool) => {
    let registration: unknown;
    try {
      registration = context.registerTool(
        {
          ...tool,
          execute: async (input?: Record<string, unknown>) => {
            try {
              return await tool.execute(input ?? {});
            } catch (error) {
              return {
                content: [
                  {
                    type: "text",
                    text: `${tool.name} failed: ${error instanceof Error ? error.message : String(error)}`,
                  },
                ],
                isError: true,
              } satisfies ToolResult;
            }
          },
        },
        { signal },
      );
    } catch {
      // A tool the browser refuses is left out; the others still register.
      return;
    }
    // Chrome's preview returned a handle with unregister().
    const handle = registration as { unregister?: () => void } | undefined;
    if (typeof handle?.unregister === "function") {
      undo.push(() => handle.unregister!());
    }
    // A refused or aborted registration leaves that one tool out.
    void Promise.resolve(registration).catch(() => {});
  };

  siteTools({
    fetchText,
    navigate: page.navigate,
    setTheme: page.setTheme,
    draftContact: async (draft) => {
      if (fillContactDraft(draft)) return true;
      await page.openContact();
      // The form takes drafts once it has mounted.
      for (let tries = 0; tries < 30; tries += 1) {
        await wait(100);
        if (fillContactDraft(draft)) return true;
      }
      return false;
    },
  }).forEach(register);

  return () => {
    for (const step of undo) step();
  };
}
