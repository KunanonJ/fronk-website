import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type InstallTab = {
  /** Stable, URL-safe id, unique within this tab set. */
  id: string;
  label: string;
  panel: ReactNode;
};

type InstallTabsProps = {
  /** Names the tablist, e.g. "Install the whole pack with". */
  label: string;
  /** Prefix for element ids, unique on the page. */
  idBase: string;
  tabs: readonly InstallTab[];
  /** Panel floor, so switching tabs does not move the cards below. */
  panelClassName?: string;
};

/**
 * The install chooser (bento canvas, design spec 4.8 and 4.9): the canvas
 * toggle chips (ink when selected) with WAI-ARIA tabs behaviour, automatic
 * activation: Left/Right move between tabs and select them, Home/End jump to
 * the ends, Tab moves into the panel. Local state, never the URL. Every panel
 * is server-rendered; inactive ones are `hidden`, so the first is already
 * correct before hydration.
 */
export default function InstallTabs({
  label,
  idBase,
  tabs,
  panelClassName,
}: InstallTabsProps) {
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => select(index + 1),
      ArrowLeft: () => select(index - 1),
      Home: () => select(0),
      End: () => select(tabs.length - 1),
    };
    const action = keys[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  return (
    <>
      <div role="tablist" aria-label={label} className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => {
          const active = index === selected;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${idBase}-tab-${tab.id}`}
              aria-selected={active}
              aria-controls={`${idBase}-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full border px-4 text-left text-sm font-medium",
                active
                  ? "border-cta bg-cta text-on-cta"
                  : "border-hairline-strong bg-surface text-ink-2",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${idBase}-panel-${tab.id}`}
          aria-labelledby={`${idBase}-tab-${tab.id}`}
          tabIndex={0}
          hidden={index !== selected}
          className={cn(
            "flex flex-col border-t border-hairline pt-[18px]",
            panelClassName,
          )}
        >
          {tab.panel}
        </div>
      ))}
    </>
  );
}
