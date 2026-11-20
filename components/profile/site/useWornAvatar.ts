import { useEffect, useState } from "react";
import { FOUND_KEY, TRAITS_EVENT } from "@/lib/brand/traitEvents";

/**
 * The nav avatar dressed as the visitor has it (now-building-and-genz
 * Phase 3): their trait, and the gold edition once all six are found. The
 * plain cut on the server, at hydration and for a visitor with no trait; the
 * trait store and the traits' drawings load only once this device has found
 * one, or one is found on this page.
 */
export function useWornAvatar(base: readonly string[]): readonly string[] {
  const [rows, setRows] = useState(base);

  useEffect(() => {
    let live = true;
    let stop: (() => void) | undefined;
    const dress = () => {
      window.removeEventListener(TRAITS_EVENT, dress);
      void import("@/lib/brand/traitStore").then((store) => {
        if (live) stop = store.watchAvatar(base, setRows);
      });
    };
    window.addEventListener(TRAITS_EVENT, dress);
    try {
      if (localStorage.getItem(FOUND_KEY)) dress();
    } catch {
      // Storage blocked: a trait found on this page still dresses it.
    }
    return () => {
      live = false;
      window.removeEventListener(TRAITS_EVENT, dress);
      stop?.();
    };
  }, [base]);

  return rows;
}
