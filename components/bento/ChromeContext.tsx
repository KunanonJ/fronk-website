import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "@/lib/router/navigation";

export type ChromePanel = "share" | "menu";

type ChromeState = {
  /** The open header panel, or null. Only one opens at a time. */
  panel: ChromePanel | null;
  /** Opens `panel`, or closes it if it is already open. */
  toggle: (panel: ChromePanel, trigger: HTMLElement | null) => void;
  /** Closes the open panel; `restoreFocus` returns focus to its trigger. */
  close: (restoreFocus?: boolean) => void;
};

const ChromeContext = createContext<ChromeState | null>(null);

/**
 * Header panel state for the bento chrome (phase 7a). The share panel is
 * anchored to the header, but hero share pills on inner pages open it too,
 * so the state lives here, above both. A panel belongs to the page it was
 * opened on: navigating closes it without an effect.
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<{
    panel: ChromePanel | null;
    path: string;
  }>({ panel: null, path: pathname });
  const trigger = useRef<HTMLElement | null>(null);
  const panel = state.path === pathname ? state.panel : null;

  const toggle = useCallback(
    (next: ChromePanel, el: HTMLElement | null) => {
      trigger.current = el;
      setState((current) => ({
        panel:
          current.path === pathname && current.panel === next ? null : next,
        path: pathname,
      }));
    },
    [pathname],
  );

  const close = useCallback(
    (restoreFocus = false) => {
      setState({ panel: null, path: pathname });
      if (restoreFocus) trigger.current?.focus();
    },
    [pathname],
  );

  const value = useMemo(
    () => ({ panel, toggle, close }),
    [panel, toggle, close],
  );
  return (
    <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
  );
}

export function useChrome(): ChromeState {
  const value = useContext(ChromeContext);
  if (!value) throw new Error("useChrome needs a ChromeProvider");
  return value;
}
