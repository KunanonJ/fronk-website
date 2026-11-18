import { useCallback, useState } from "react";
import Link from "@/components/navigation/Link";
import { CheckIcon, CopyIcon, MailIcon } from "@/components/bento/icons";
import { DitherField } from "@/components/ds/DitherField";
import { SwapArrow, pillClass } from "@/components/ds/Pill";
import {
  closePopover,
  useHydrated,
  usePopover,
} from "@/components/profile/site/popover";
import { composeHref, sayHello } from "@/lib/content/profileChrome";
import { site } from "@/lib/content/landing";
import { cn } from "@/lib/utils/cn";

/*
 * Say hello (profile redesign, design spec 7.4): the trigger pill and its
 * popover with the address and three or four ways to write. The popover is
 * native (`popover="auto"` and `popovertarget`), so it opens, light-dismisses
 * and closes on Escape before hydration and without script. Copy email needs
 * the Clipboard API, so it renders only after hydration.
 *
 * The trigger and the panel are separate components, so the nav can put the
 * panel outside its animated row (a panel without the Popover API is not in the
 * top layer and would take the row's opacity and blur).
 */

type Placement = "nav" | "footer";

/** The trigger pill. Its `aria-expanded` is written by script, as the state changes. */
export function SayHelloTrigger({
  id,
  placement,
}: {
  /** The popover's id, which the trigger's `popovertarget` names. */
  id: string;
  placement: Placement;
}) {
  return (
    <button
      type="button"
      popoverTarget={id}
      aria-haspopup="dialog"
      className={cn(
        pillClass({ size: placement === "footer" ? "lg" : "nav" }),
        "pf-say__trigger",
        `pf-say__trigger--${placement}`,
      )}
    >
      <span className="pf-say__text">{sayHello.label}</span>
      <MailIcon className="pf-say__icon" size={18} />
      <SwapArrow />
    </button>
  );
}

/** The popover: the address, the copy action and the links. */
export function SayHelloPanel({
  id,
  placement,
}: {
  id: string;
  placement: Placement;
}) {
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);
  const reset = useCallback(() => setCopied(false), []);
  usePopover(id, { onClose: reset });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
    } catch {
      // The address is selectable text above, so nothing is lost.
    }
  };
  const close = () => closePopover(id);

  return (
    <div
      id={id}
      popover="auto"
      role="dialog"
      aria-label={sayHello.name}
      className={cn("pf-say__panel", `pf-say__panel--${placement}`)}
    >
      <DitherField
        className="pf-say__dither"
        fade="up"
        cell={8}
        stops={["--tint-3", "--tint-4"]}
      />
      <div className="pf-say__body">
        <p className="t-meta pf-say__eyebrow">{sayHello.eyebrow}</p>
        <p className="pf-say__address">{sayHello.address}</p>
        <div className="pf-say__rows">
          {hydrated ? (
            <button
              type="button"
              className={cn(
                pillClass({ variant: "dark", size: "md" }),
                "pf-say__row pf-say__copy",
              )}
              onClick={copy}
            >
              {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              {copied ? sayHello.copied : sayHello.copy}
            </button>
          ) : null}
          <a
            className="pf-say__row"
            href={composeHref(site.email)}
            target="_blank"
            rel="noopener"
            onClick={close}
          >
            {sayHello.compose}{" "}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <a
            className="pf-say__row"
            href={`mailto:${site.email}`}
            onClick={close}
          >
            {sayHello.mailApp}
          </a>
          <Link
            className="pf-say__row"
            href={sayHello.contactHref}
            onClick={close}
          >
            {sayHello.contactForm}
          </Link>
        </div>
        <span className="sr-only" aria-live="polite">
          {copied ? sayHello.copied : ""}
        </span>
      </div>
    </div>
  );
}

/** The trigger and its panel together, where the panel can sit beside the trigger (the footer). */
export function SayHello({
  id,
  placement,
}: {
  id: string;
  placement: Placement;
}) {
  return (
    <>
      <SayHelloTrigger id={id} placement={placement} />
      <SayHelloPanel id={id} placement={placement} />
    </>
  );
}
