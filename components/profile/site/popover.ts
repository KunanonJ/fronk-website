import { useEffect, useSyncExternalStore } from "react";

/*
 * Native popovers of the profile chrome (design spec 7.4 to 7.6). Say hello and
 * the phone menu open, light-dismiss and close on Escape with no script at all:
 * their invokers carry `popovertarget`. Script adds what the native element
 * cannot do alone: the invoker's aria-expanded and names, focus on open and back
 * on close, and a fallback for engines without the Popover API, where the panel
 * is hidden with the `hidden` attribute and the invoker toggles it.
 */

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

/** Whether a native popover is showing. False where the engine lacks popovers. */
export function isPopoverOpen(panel: HTMLElement): boolean {
  try {
    return panel.matches(":popover-open");
  } catch {
    return false;
  }
}

function supportsPopover(): boolean {
  return (
    typeof HTMLElement !== "undefined" &&
    typeof (HTMLElement.prototype as { showPopover?: unknown }).showPopover ===
      "function"
  );
}

/** Closes a native popover, if it is open (a link inside it does this). */
export function closePopover(panelId: string): void {
  const panel = document.getElementById(panelId);
  if (panel && isPopoverOpen(panel)) panel.hidePopover();
}

/** The state after a `toggle` event: its `newState` when the engine gives one. */
function openAfter(event: Event, panel: HTMLElement): boolean {
  const state = (event as Event & { newState?: unknown }).newState;
  return typeof state === "string" ? state === "open" : isPopoverOpen(panel);
}

interface PopoverOptions {
  /** The invoker's accessible name while the popover is open, and closed. */
  readonly names?: { readonly open: string; readonly closed: string };
  /** Runs when the popover closes, from its event and never at mount. */
  readonly onClose?: () => void;
}

/**
 * Wires the popover `panelId` to its invoker (the element with
 * `popovertarget` set to that id). Writes the invoker's attributes and moves
 * focus; sets no React state, so it is safe in an effect.
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

    // Mirrors the state onto the invoker. The attributes are written here
    // rather than rendered, so React never resets them on a later render.
    const reflect = (open: boolean) => {
      invoker.setAttribute("aria-expanded", String(open));
      if (openName !== undefined && closedName !== undefined) {
        invoker.setAttribute("aria-label", open ? openName : closedName);
      }
    };
    // Focus goes back to the invoker only when it was inside the popover, so
    // an outside click keeps the focus where the reader put it.
    const settle = (open: boolean) => {
      reflect(open);
      if (open) {
        panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
        return;
      }
      if (panel.contains(document.activeElement)) invoker.focus();
      onClose?.();
    };

    if (!supportsPopover()) {
      // Engines without popovers: the panel is a plain block the script hides.
      panel.hidden = true;
      reflect(false);
      const show = (open: boolean) => {
        if (open === !panel.hidden) return;
        panel.hidden = !open;
        settle(open);
      };
      // `hidden` can read "until-found" in the DOM typings; only true means hidden here.
      const onClick = () => show(panel.hidden !== false);
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") show(false);
      };
      const onPointer = (event: Event) => {
        const target = event.target as Node | null;
        if (target && !panel.contains(target) && !invoker.contains(target)) {
          show(false);
        }
      };
      invoker.addEventListener("click", onClick);
      document.addEventListener("keydown", onKey);
      document.addEventListener("pointerdown", onPointer);
      return () => {
        invoker.removeEventListener("click", onClick);
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("pointerdown", onPointer);
      };
    }

    reflect(isPopoverOpen(panel));
    const onToggle = (event: Event) => settle(openAfter(event, panel));
    panel.addEventListener("toggle", onToggle);
    return () => panel.removeEventListener("toggle", onToggle);
  }, [panelId, openName, closedName, onClose]);
}
