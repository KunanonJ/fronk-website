import {
  burstPixels,
  reducedMotion,
} from "@/components/profile/site/secrets/burst";
import { award, tell, wear } from "@/lib/brand/traitStore";

/*
 * The pixel party (now-building-and-genz Phase 3), loaded on demand by the
 * Konami code (Secrets) or ⌘K's /party: a burst of the intro's square pixels
 * out of the nav's avatar, over in under two seconds, and then the avatar
 * puts on Shades. Found for the first time, the toast says so; found before,
 * the toast says it is on again. Under reduced motion there is no burst, only
 * the trait and the toast. The pixels fly and fade over the page without
 * covering it or catching the pointer, and nothing flashes.
 */

/** The burst is over, and Shades go on, after this many ms. */
export const PARTY_MS = 1800;
const TRAIT = "shades";
let partying = false;

/** The nav avatar's centre, where the pixels set off. */
function origin(): [number, number] {
  const box = document
    .querySelector(".pf-nav__avatar")
    ?.getBoundingClientRect();
  return box && box.width > 0
    ? [box.left + box.width / 2, box.top + box.height / 2]
    : [40, 40];
}

/**
 * Brings the bar back if it hid on scroll (the code's ↓ ↓ scroll the page),
 * so the avatar is seen; the next scroll down hides it again.
 */
function showBar(): void {
  document.querySelector(".pf-nav")?.removeAttribute("data-away");
}

function putOnShades(): void {
  partying = false;
  showBar();
  if (award(TRAIT, "party")) return;
  wear(TRAIT);
  tell({ id: TRAIT, isNew: false });
}

/** Throws the party; a second call while one runs does nothing. */
export function startParty(): void {
  if (partying) return;
  if (reducedMotion()) {
    putOnShades();
    return;
  }
  partying = true;
  showBar();
  const [x, y] = origin();
  const burst = document.createElement("div");
  burst.className = "intro-pixels";
  burst.dataset.testid = "party-pixels";
  burst.setAttribute("aria-hidden", "true");
  burst.style.cssText = `position:fixed;left:${x}px;top:${y}px;z-index:85`;
  // Mostly right and down: the avatar sits in the top left corner.
  const pixels = burstPixels({
    count: 56,
    reach: [120, 420],
    ms: PARTY_MS - 200,
    stagger: 600,
    arc: [-Math.PI * 0.3, Math.PI * 0.85],
  });
  for (const pixel of pixels) {
    const span = document.createElement("span");
    span.className = "intro-pixel";
    for (const [name, value] of Object.entries(pixel)) {
      span.style.setProperty(name, value);
    }
    burst.append(span);
  }
  document.body.append(burst);
  window.setTimeout(() => {
    burst.remove();
    putOnShades();
  }, PARTY_MS);
}
