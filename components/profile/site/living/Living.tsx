import { useEffect, useState } from "react";
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
 * - without, the ship log under the Now line: the latest commit on main
 *   ("Shipped 3h ago: <subject>", linking to the commit), asked for only
 *   once the footer's card comes near the screen, and nothing at all when
 *   it cannot be read.
 *
 * Its stylesheet (src/styles/living.css) comes with it. Full-page captures
 * take both out of the flow (tests/e2e/screenshot-no-clock.css).
 */

/** Near the screen: within half a screen below it. */
const NEAR: IntersectionObserverInit = { rootMargin: "0px 0px 50% 0px" };

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

/** The latest commit, or null while it loads or when it cannot be read. */
function useShipped(): ShipLogEntry | null {
  const [entry, setEntry] = useState<ShipLogEntry | null>(null);

  useEffect(() => {
    let live = true;
    const load = () => {
      fetch(SHIPPED_PATH)
        // The body is read whatever the status: an unread one keeps the
        // request open, and the page never goes network-idle.
        .then(async (res) => {
          const json: unknown = await res.json();
          return res.ok ? json : null;
        })
        .then((json) => {
          if (live && isShipped(json))
            setEntry({ shipped: json, ago: shippedAgo(json.date, Date.now()) });
        })
        .catch(() => {
          // Offline or GitHub down: the footer shows no ship log.
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
  }, []);

  return entry;
}

function ShipLog() {
  const entry = useShipped();
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

export default function Living({ hour }: { hour?: number }) {
  return hour === undefined ? <ShipLog /> : <HourGuess hour={hour} />;
}
