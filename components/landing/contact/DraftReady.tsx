import { useEffect, useState, type CSSProperties } from "react";
import {
  burstPixels,
  reducedMotion,
} from "@/components/profile/site/secrets/burst";
import { award } from "@/lib/brand/traitStore";
import { secretsCopy } from "@/lib/content/secretsCopy";
import secretsCss from "@/src/styles/secrets.css?url";

/*
 * The contact form's Ready moment (now-building-and-genz Phase 3), loaded by
 * ContactForm when the email is ready: a small burst of the intro's pixels
 * out of the check mark and a "Draft ready" stamp beside it, and then the
 * Lapel pin is found (the toast says so the first time). It sits in the
 * mark's aria-hidden box: the status above already says the email is ready.
 * Under reduced motion the stamp is still and there is no burst.
 */

/** The burst is over, and the pin found, after this many ms. */
const BURST_MS = 620;

export default function DraftReady() {
  const [pixels] = useState(() =>
    reducedMotion()
      ? []
      : burstPixels({ count: 18, reach: [44, 96], ms: BURST_MS, stagger: 80 }),
  );
  const [bursting, setBursting] = useState(pixels.length > 0);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setBursting(false);
        award("pin", "contact");
      },
      pixels.length > 0 ? BURST_MS : 0,
    );
    return () => window.clearTimeout(timer);
  }, [pixels]);

  return (
    <>
      <link rel="stylesheet" href={secretsCss} precedence="pf-secrets" />
      {bursting ? (
        <span className="intro-pixels" data-testid="ready-pixels">
          {pixels.map((style, at) => (
            <span
              key={at}
              className="intro-pixel"
              style={style as CSSProperties}
            />
          ))}
        </span>
      ) : null}
      <span className="pf-ready-stamp">{secretsCopy.stamp}</span>
    </>
  );
}
