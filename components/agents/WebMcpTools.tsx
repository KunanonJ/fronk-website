import { useRouter } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { fillContactDraft } from "@/lib/agents/contactDraft";
import type { SiteTool, ToolResult } from "@/lib/agents/webmcp";

/*
 * Registers the site's WebMCP tools (lib/agents/webmcp.ts) with the browser,
 * where it supports WebMCP: `document.modelContext` in the current draft,
 * `navigator.modelContext` in Chrome's earlier preview. Elsewhere it does
 * nothing. Mounted once in the root document, so the tools stay registered
 * across client navigations; unmounting unregisters them. The tools and the
 * content they read load only where WebMCP exists, so no other visitor
 * downloads them.
 */

interface ModelContext {
  registerTool(
    tool: object,
    options?: { signal?: AbortSignal },
  ): Promise<unknown> | unknown;
}

function modelContext(): ModelContext | null {
  const context =
    (document as Document & { modelContext?: ModelContext }).modelContext ??
    (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  return context && typeof context.registerTool === "function" ? context : null;
}

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));

async function fetchText(path: string): Promise<string> {
  const response = await fetch(path, {
    headers: { accept: "text/markdown, text/plain, application/json" },
  });
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.text();
}

export function WebMcpTools() {
  const router = useRouter();
  const { setTheme } = useTheme();
  // The tools register once; they read the current setter when they run.
  const setThemeRef = useRef(setTheme);
  useEffect(() => {
    setThemeRef.current = setTheme;
  }, [setTheme]);

  useEffect(() => {
    const context = modelContext();
    if (!context) return;
    const controller = new AbortController();
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
          { signal: controller.signal },
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

    void import("@/lib/agents/webmcp")
      .then(({ siteTools }) => {
        if (controller.signal.aborted) return;
        siteTools({
          fetchText,
          navigate: async (path) => {
            await router.navigate({ href: path });
          },
          setTheme: (theme) => setThemeRef.current(theme),
          draftContact: async (draft) => {
            if (fillContactDraft(draft)) return true;
            await router.navigate({ to: "/contact" });
            // The form takes drafts once it has mounted.
            for (let tries = 0; tries < 30; tries += 1) {
              await wait(100);
              if (fillContactDraft(draft)) return true;
            }
            return false;
          },
        }).forEach(register);
      })
      // The tools are an extra: if their chunk fails to load, the page stays
      // as it is, without an unhandled rejection.
      .catch(() => {});

    return () => {
      controller.abort();
      for (const step of undo) step();
    };
  }, [router]);

  return null;
}
