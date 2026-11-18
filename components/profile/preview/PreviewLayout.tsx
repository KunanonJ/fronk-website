import type { ReactNode } from "react";
import { useTheme } from "next-themes";
import { pillClass } from "@/components/ds/Pill";

/*
 * Layout for the hidden profile-redesign previews (/preview/*, Phases 0 to
 * 5). No site chrome yet: Phase 1 builds it here. The theme button is a
 * stand-in until the new toggle lands. Phase 6 deletes the previews.
 */
export default function PreviewLayout({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <div className="min-h-[100svh] bg-page text-ink">
      <a href="#main" className="ds-skip">
        Skip to content
      </a>
      <div className="ds-wrap flex flex-wrap items-center justify-between gap-4 py-6">
        <p className="t-meta text-ink-2">
          Profile redesign preview · not indexed
        </p>
        <button
          type="button"
          className={pillClass({ variant: "ghost", size: "sm" })}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          Switch theme
        </button>
      </div>
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  );
}
