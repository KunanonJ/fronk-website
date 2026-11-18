import { useEffect, useSyncExternalStore } from "react";

/*
 * Native popovers of the profile chrome (design spec 7.4 to 7.6). Say hello and
 * the phone menu open, light-dismiss and close on Escape with no script: their
 * invokers carry `popovertarget`. Script adds what the native element cannot do
 * alone: the invoker's aria-expanded and names, focus on open and back on close,
 * and closing on a route change.
 *
 * Where the engine has no Popover API, the panel is hidden by CSS until the
 * script sets `data-open` on it, and the invoker toggles it. Both paths report
 * every change as a `toggle` event (with `newState`, as a native one carries),
 * so one listener does the invoker's bookkeeping for either.
 */

/** The ids of the chrome's popovers, which their invokers name. */
export const POPOVER_IDS = {
  nav: "say-hello-nav",
  footer: "say-hello-footer",
  menu: "site-menu",
} as const;

const FOCUSABLE =
  "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";

const noop = () => () => {};

/** False on the server and during hydration, true once the client renders. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Whether the engine can show a popover natively. */
function supportsPopover(): boolean {
  return (
    typeof HTMLElement !== "undefined" &&
    typeof (HTMLElement.prototype as { showPopover?: unknown }).showPopover ===
      "function"
  );
}

/** Whether a popover is open: its `:popover-open` state, or `data-open` without the Popover API. */
export function isPopoverOpen(panel: HTMLElement): boolean {
  if (!supportsPopover()) return panel.hasAttribute("data-open");
  try {
    return panel.matches(":popover-open");
  } catch {
    return false;
  }
}

/** The toggle event a native popover fires, so one listener serves both paths. */
function toggleEvent(open: boolean): Event {
  const event = new Event("toggle");
  Object.assign(event, { newState: open ? "open" : "closed" });
  return event;
}

/** The state after a `toggle` event: its `newState` when the engine gives one. */
function openAfter(event: Event, panel: HTMLElement): boolean {
  const state = (event as Event & { newState?: unknown }).newState;
  return typeof state === "string" ? state === "open" : isPopoverOpen(panel);
}

/** Opens or closes a panel where the engine has no popovers, and reports it as a native toggle would. */
function setFallbackOpen(panel: HTMLElement, open: boolean): void {
  if (open === isPopoverOpen(panel)) return;
  if (open) panel.setAttribute("data-open", "");
  else panel.removeAttribute("data-open");
  panel.dispatchEvent(toggleEvent(open));
}

/**
 * Closes a popover by id, as a light dismiss would. Its toggle event then runs
 * the invoker's bookkeeping (aria-expanded, focus), on every engine.
 */
export function closePopover(panelId: string): void {
  const panel = document.getElementById(panelId);
  if (!panel || !isPopoverOpen(panel)) return;
  if (supportsPopover()) panel.hidePopover();
  else setFallbackOpen(panel, false);
}

export interface PopoverOptions {
  /** The invoker's accessible name while the popover is open, and while it is closed. */
  readonly names?: { readonly open: string; readonly closed: string };
  /** Runs when the popover closes, from its toggle event and never at mount. */
  readonly onClose?: () => void;
}

/**
 * Wires the popover `panelId` to its invoker (the element whose `popovertarget`
 * names it). Writes the invoker's attributes and moves focus, and sets no React
 * state, so it is safe in an effect.
 */
export function usePopover(
  panelId: string,
  { names, onClose }: PopoverOptions = {},
): void {
  const openName = names?.open;
  const closedName = names?.closed;
  useEffect(() => {
    const panel = document.getElementById(panelId);
    const invoker = document.querySelector<HTMLElement>(
      `[popovertarget="${panelId}"]`,
    );
    if (!panel || !invoker) return;

    // The invoker's attributes are written here, not rendered, so React never
    // resets them on a later render.
    const reflect = (open: boolean) => {
      invoker.setAttribute("aria-expanded", String(open));
      if (openName !== undefined && closedName !== undefined) {
        invoker.setAttribute("aria-label", open ? openName : closedName);
      }
    };
    // Focus goes back to the invoker only when it was inside the popover, so an
    // outside press keeps the focus where the reader put it.
    const settle = (open: boolean) => {
      reflect(open);
      if (open) {
        panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
        return;
      }
      if (panel.contains(document.activeElement)) invoker.focus();
      onClose?.();
    };
    const onToggle = (event: Event) => settle(openAfter(event, panel));
    panel.addEventListener("toggle", onToggle);
    reflect(isPopoverOpen(panel));

    if (supportsPopover()) {
      return () => panel.removeEventListener("toggle", onToggle);
    }

    // Without the Popover API: the invoker toggles the panel, and Escape or a
    // press outside closes it.
    const onClick = () => setFallbackOpen(panel, !isPopoverOpen(panel));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFallbackOpen(panel, false);
    };
    const onPointer = (event: Event) => {
      const target = event.target as Node | null;
      if (target && !panel.contains(target) && !invoker.contains(target)) {
        setFallbackOpen(panel, false);
      }
    };
    invoker.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      panel.removeEventListener("toggle", onToggle);
      invoker.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [panelId, openName, closedName, onClose]);
}
