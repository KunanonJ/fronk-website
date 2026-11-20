import { useEffect, useState, useSyncExternalStore } from "react";
import { hourGuess, shippedCopy } from "@/lib/content/livingCopy";
import {
  SHIPPED_PATH,
  isShipped,
  shippedAgo,
  type Shipped,
} from "@/lib/github/shipped";
import livingCss from "@/src/styles/living.css?url";

/*
 * The footer's living status (now-building-and-genz Phase 5), the lazy
 * chunk SiteFooter loads once the page runs, so no first load carries it
 * and the server draws none of it:
 *
 * - with `hour`, the guess beside the Bangkok clock ("probably shipping"),
 *   which LocalTime hands the hour at each minute: it has no timer of its
 *   own;
 * - without, the ship log: the latest commit on main ("Shipped 3h ago:
 *   <subject>", linking to the commit), asked for only once the footer's
 *   card comes near the screen, and nothing at all when it cannot be read.
 *
 * The ship log arrives after the footer has been laid out, so it goes where
 * it pushes nothing (UX sweep 21-11-26: under the Now line it pushed the
 * place's line, the page list and the copyright down by up to 67 px, a
 * layout shift of 0.04 to 0.06 on phones). From 810 px the card has
 * columns, and the name block's column has room to spare under its last
 * line, the place's: the log goes there (`at="name"`). Under 810 px the card
 * is one column and every line in it has the lists below it, and the footer
 * may not grow either (its dither is pinned to its foot): the log is the
 * card's last child (`at="end"`), drawn under the card out of the flow
 * (living.css). SiteFooter offers both places; only the place for the
 * screen's width asks for the log and draws it.
 *
 * Its stylesheet (src/styles/living.css) comes with it. Full-page captures
 * take both out of the flow (tests/e2e/screenshot-no-clock.css).
 */

/** Near the screen: within half a screen below it. */
const NEAR: IntersectionObserverInit = { rootMargin: "0px 0px 50% 0px" };

/** Where the card has columns (shell.css, `.pf-footer__card`). */
const COLUMNS = "(min-width: 50.625rem)";

/** Where the ship log stands: see the header. */
type ShipLogPlace = "name" | "end";

function subscribeColumns(onChange: () => void): () => void {
  const query = window.matchMedia(COLUMNS);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True when `at` is the ship log's place at the screen's width. */
function useHere(at: ShipLogPlace): boolean {
  return useSyncExternalStore(
    subscribeColumns,
    () => window.matchMedia(COLUMNS).matches === (at === "name"),
    () => false,
  );
}

function Sheet() {
  return <link rel="stylesheet" href={livingCss} precedence="pf-living" />;
}

function HourGuess({ hour }: { hour: number }) {
  return (
    <>
      <Sheet />
      <span className="pf-footer__guess">{hourGuess(hour)}</span>
    </>
  );
}

/** The latest commit and how long ago it was, as of its arrival. */
interface ShipLogEntry {
  readonly shipped: Shipped;
  readonly ago: string;
}

/** The latest commit, or null when it cannot be read. */
function requestShipped(): Promise<ShipLogEntry | null> {
  return (
    fetch(SHIPPED_PATH)
      // The body is read whatever the status: an unread one keeps the
      // request open, and the page never goes network-idle.
      .then(async (res) => {
        const json: unknown = await res.json();
        return res.ok ? json : null;
      })
      .then((json) =>
        isShipped(json)
          ? { shipped: json, ago: shippedAgo(json.date, Date.now()) }
          : null,
      )
      // Offline or GitHub down: the footer shows no ship log.
      .catch(() => null)
  );
}

/**
 * The latest commit, or null while it loads, when it cannot be read, or
 * while `here` is false: the log stands in the footer's other place, which
 * asks instead (so a page asks once, and again only if the screen's width
 * crosses 810 px).
 */
function useShipped(here: boolean): ShipLogEntry | null {
  const [entry, setEntry] = useState<ShipLogEntry | null>(null);

  useEffect(() => {
    if (!here) return;
    let live = true;
    const load = () => {
      void requestShipped().then((found) => {
        if (live && found) setEntry(found);
      });
    };
    const card = document.querySelector(".pf-footer__card");
    if (!card || typeof IntersectionObserver === "undefined") {
      load();
      return () => {
        live = false;
      };
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      load();
    }, NEAR);
    observer.observe(card);
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [here]);

  return here ? entry : null;
}

function ShipLog({ at }: { at: ShipLogPlace }) {
  const entry = useShipped(useHere(at));
  if (!entry) return null;
  const { shipped, ago } = entry;
  return (
    <p className="pf-footer__shipped">
      <Sheet />
      <span className="ds-px-dot" aria-hidden="true" />
      <span>
        {shippedCopy.lead} <time dateTime={shipped.date}>{ago}</time>:{" "}
        <a href={shipped.url} target="_blank" rel="noopener">
          {shipped.subject}
          <span className="sr-only"> {shippedCopy.opens}</span>
        </a>
      </span>
    </p>
  );
}

export default function Living({
  hour,
  at = "end",
}: {
  /** The hour in Bangkok: the guess. Without it, the ship log. */
  hour?: number;
  /** The ship log's place: see the header. */
  at?: ShipLogPlace;
}) {
  return hour === undefined ? <ShipLog at={at} /> : <HourGuess hour={hour} />;
}
