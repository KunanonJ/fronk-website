import {
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Eraser, MousePointer2, PenTool, Sticker } from "lucide-react";
import { canvasMock } from "@/lib/content/home";

/*
 * The canvas toolbar made real (now-building-and-genz Phase 4), from 810 px
 * with a mouse: Move, Stickers, Pen, the ink's colour and Clear, a toolbar of
 * buttons with one tab stop (the arrow keys, Home and End move along it).
 * CanvasMock owns the state; the drawing layer is a lazy chunk.
 *
 * Each slot shows its own tool from the first paint, so what a button
 * shows is what it does. Under the pointer, or with keyboard focus, the
 * toolbar wakes for good: that is when the drawing layer starts to load.
 */

export type CanvasTool = "move" | "pen" | "stickers";
export type CanvasInkColour = "violet" | "coral";

const ICON = { size: 15, strokeWidth: 1.8 } as const;

/** The ink's colour as a dot, ringed in the toolbar's ink (3:1 on paper). */
function InkDot({ ink }: { ink: CanvasInkColour }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{ fill: ink === "violet" ? "var(--accent)" : "var(--coral)" }}
    >
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

/** A slot of the toolbar. */
interface Slot {
  readonly key: string;
  readonly label: string;
  /** A tool: pressed while it is on. Absent for an action. */
  readonly pressed?: boolean;
  readonly disabled?: boolean;
  /** Said after the name, and shown as the tooltip. */
  readonly hint?: string;
  /** The tool's icon. */
  readonly icon: ReactNode;
  readonly press: () => void;
}

const ARROWS: Record<string, (at: number, last: number) => number> = {
  ArrowRight: (at, last) => (at === last ? 0 : at + 1),
  ArrowLeft: (at, last) => (at === 0 ? last : at - 1),
  Home: () => 0,
  End: (_, last) => last,
};

/** The toolbar's buttons, in order. */
const buttonsOf = (bar: HTMLElement) => [
  ...bar.querySelectorAll<HTMLButtonElement>(":scope > button"),
];

export function CanvasToolbar({
  tool,
  ink,
  canClear,
  awake,
  onWake,
  onTool,
  onInk,
  onClear,
}: {
  tool: CanvasTool;
  ink: CanvasInkColour;
  /** Something is on the canvas: Clear works. */
  canClear: boolean;
  /** Reached for once: the slots show their tools. */
  awake: boolean;
  onWake: () => void;
  onTool: (tool: CanvasTool) => void;
  onInk: () => void;
  onClear: () => void;
}) {
  const { tools } = canvasMock;
  /** The one button in the tab order: the last one focused. */
  const [stop, setStop] = useState(0);
  const slots: readonly Slot[] = [
    {
      key: "move",
      label: tools.move,
      pressed: tool === "move",
      icon: <MousePointer2 {...ICON} />,
      press: () => onTool("move"),
    },
    {
      key: "stickers",
      label: tools.stickers,
      pressed: tool === "stickers",
      hint: tool === "stickers" ? tools.stamp : undefined,
      icon: <Sticker {...ICON} />,
      press: () => onTool("stickers"),
    },
    {
      key: "pen",
      label: tools.pen,
      pressed: tool === "pen",
      icon: <PenTool {...ICON} />,
      press: () => onTool("pen"),
    },
    {
      key: "ink",
      label: tools.ink(tools.inks[ink]),
      icon: <InkDot ink={ink} />,
      press: onInk,
    },
    {
      key: "clear",
      label: tools.clear,
      disabled: !canClear,
      icon: <Eraser {...ICON} />,
      press: onClear,
    },
  ];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROWS[event.key];
    if (!step) return;
    event.preventDefault();
    const list = buttonsOf(event.currentTarget);
    list[step(stop, list.length - 1)]?.focus();
  };

  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const at = buttonsOf(event.currentTarget).findIndex(
      (button) => button === (event.target as Element),
    );
    if (at >= 0) setStop(at);
    onWake();
  };

  return (
    <div
      className="pf-mock__tools"
      role="toolbar"
      aria-label={tools.label}
      data-awake={awake ? "" : undefined}
      onPointerEnter={onWake}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
    >
      {slots.map((slot, at) => (
        <button
          key={slot.key}
          type="button"
          tabIndex={at === stop ? 0 : -1}
          aria-label={slot.label}
          title={slot.hint ? `${slot.label}: ${slot.hint}` : slot.label}
          aria-pressed={slot.pressed}
          aria-disabled={slot.disabled || undefined}
          data-on={slot.pressed ? "" : undefined}
          onClick={() => {
            if (!slot.disabled) slot.press();
          }}
        >
          {slot.icon}
        </button>
      ))}
    </div>
  );
}
