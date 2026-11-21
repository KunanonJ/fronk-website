import { useRouter } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import type { ModelContext } from "@/components/agents/registerWebMcpTools";

/*
 * Registers the site's WebMCP tools (lib/agents/webmcp.ts) with the browser,
 * where it supports WebMCP: `document.modelContext` in the current draft,
 * `navigator.modelContext` in Chrome's earlier preview. Elsewhere it does
 * nothing. Mounted once in the root document, so the tools stay registered
 * across client navigations; unmounting unregisters them. The tools, the
 * content they read and the registration itself
 * (components/agents/registerWebMcpTools.ts) load only where WebMCP exists,
 * so no other visitor downloads them.
 */

function modelContext(): ModelContext | null {
  const context =
    (document as Document & { modelContext?: ModelContext }).modelContext ??
    (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
  return context && typeof context.registerTool === "function" ? context : null;
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
    let unregister: (() => void) | undefined;

    void import("@/components/agents/registerWebMcpTools")
      .then(({ registerWebMcpTools }) => {
        if (controller.signal.aborted) return;
        unregister = registerWebMcpTools(
          context,
          {
            navigate: async (path) => {
              await router.navigate({ href: path });
            },
            openContact: async () => {
              await router.navigate({ to: "/contact" });
            },
            setTheme: (theme) => setThemeRef.current(theme),
          },
          controller.signal,
        );
      })
      // The tools are an extra: if their chunk fails to load, the page stays
      // as it is, without an unhandled rejection.
      .catch(() => {});

    return () => {
      controller.abort();
      unregister?.();
    };
  }, [router]);

  return null;
}
