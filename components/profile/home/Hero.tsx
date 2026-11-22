import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type RefObject,
} from "react";
import { DitherField } from "@/components/ds/DitherField";
import { Badge, Chip } from "@/components/ds/labels";
import { Pill } from "@/components/ds/Pill";
import { CanvasMock } from "@/components/profile/home/CanvasMock";
import { Headline } from "@/components/profile/home/Headline";
import {
  IntroPendingScript,
  useIntroDone,
} from "@/components/profile/home/IntroGate";
import { LogoStrip } from "@/components/profile/home/LogoStrip";
import { homeHero } from "@/lib/content/home";
import { stylesheetReady } from "@/lib/router/stylesheet";
import heroCss from "@/src/styles/profile/home-hero.css?url";

/*
 * The Home hero (profile redesign, Phase 2; design spec 8.1 to 8.3, 10 and
 * 10.1): the sunset sheet with its pixel sky, the chips, the h1, the lead and
 * the two buttons, the canvas mock, and the logo strip. From 810 px the stage
 * is sticky and the sections after it slide over it; it scrolls with the
 * page until its last line is in view, so nothing in it is ever out of
 * reach, and keyboard focus inside it unsticks it (home-hero.css), so the
 * browser scrolls a focused control into view where it really is (WCAG
 * 2.4.11). The first facts (the h1, "Currently building", Contact me,
 * Résumé) are at the top of the copy, above the fold at 375 x 812 and
 * 1440 x 900. Its stylesheet (src/styles/profile/home-hero.css) is linked
 * here, so no other page loads it.
 */

/** The hero's stylesheet's precedence: its <link> below, and the loader's. */
const PRECEDENCE = "pf-home-hero";

/**
 * Home's route loader (src/routes/_landing/index.tsx): the hero's stylesheet,
 * in and loaded before a client navigation commits Home, so the router's
 * scroll to /#work, /#about or /#journey finds its section (UX hunt 2, U01).
 */
export function heroStylesheetReady(): Promise<void> {
  return stylesheetReady(heroCss, PRECEDENCE);
}

/** The stage's height, for the sticky offset in home-hero.css. */
function useStageHeight(stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () =>
      el.style.setProperty("--pf-hero-h", `${el.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stage]);
}

/** Where Work's empty top passes over the strip undrawn: home-work-about.css's query. */
const WORK_TOP_QUERY =
  "(min-width: 50.625rem) and (prefers-reduced-motion: no-preference)";

/**
 * Work's empty top over the logo strip, where the browser has no
 * scroll-driven animations (Firefox 157): Work's share of it drawn, as
 * home-work-about.css's kj-work-top draws it where they run (from Work's top
 * 150 px up the screen to 200 px), and data-top="clear" while under half,
 * when it takes no press (home-hero.css). Only where the query holds, and
 * nothing at all where the animations run. Read again on every scroll, on a
 * resize, and when the stage's height moves Work with no scroll, as a view
 * timeline follows it.
 */
function useWorkTop(stage: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = stage.current;
    const work = el?.parentElement?.querySelector<HTMLElement>(
      ":scope > .pf-hero ~ .pf-work",
    );
    if (
      !el ||
      !work ||
      typeof CSS === "undefined" ||
      typeof CSS.supports !== "function" ||
      CSS.supports("animation-timeline: view()")
    ) {
      return;
    }
    const query = window.matchMedia(WORK_TOP_QUERY);
    const clear = () => {
      work.style.removeProperty("--pf-work-top");
      delete work.dataset.top;
    };
    let last = "";
    const update = () => {
      let shown = "";
      if (query.matches) {
        // How far Work's top is up the screen (the root's scrollport).
        const up =
          document.documentElement.clientHeight -
          work.getBoundingClientRect().top;
        shown = String(Math.min(1, Math.max(0, (up - 150) / 50)));
      }
      if (shown === last) return;
      last = shown;
      if (!shown) return clear();
      work.style.setProperty("--pf-work-top", shown);
      work.dataset.top = Number(shown) < 0.5 ? "clear" : "drawn";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    query.addEventListener("change", update);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      query.removeEventListener("change", update);
      observer?.disconnect();
      clear();
    };
  }, [stage]);
}

/**
 * Focus that holds the headline still: keyboard focus (`:focus-visible`),
 * so a reader moving through the hero is not chased by a changing line, but
 * not on the motion toggle, whose own state says whether things move. A
 * mouse click leaves focus on what it pressed, which holds nothing.
 */
export function holdsHeadline(el: Element): boolean {
  if (el.closest(".ds-motion-toggle")) return false;
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

export default function Hero() {
  const ready = useIntroDone();
  const stage = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(true);
  const [focusInside, setFocusInside] = useState(false);
  useStageHeight(stage);
  useWorkTop(stage);

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    setFocusInside(holdsHeadline(event.target));
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusInside(false);
    }
  };

  return (
    <>
      <link rel="stylesheet" href={heroCss} precedence={PRECEDENCE} />
      <section
        ref={stage}
        className="pf-hero"
        aria-labelledby="hero-title"
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <IntroPendingScript />
        <div className="pf-hero__sheet" aria-hidden="true">
          <DitherField className="pf-hero__sky" />
        </div>
        <div className="pf-hero__grid ds-wrap">
          <div className="pf-hero__copy">
            <p className="pf-hero__chips">
              <Badge>{homeHero.badge}</Badge>
              <span className="sr-only">, </span>
              <Chip>{homeHero.chip}</Chip>
            </p>
            <Headline ready={ready} paused={!playing || focusInside} />
            <p className="t-lead pf-hero__lead">{homeHero.lead}</p>
            <div className="pf-hero__actions">
              <Pill href={homeHero.primaryCta.href} size="hero" arrow="swap">
                {homeHero.primaryCta.label}
              </Pill>
              <Pill href={homeHero.resumeCta.href} size="hero" variant="ghost">
                {homeHero.resumeCta.label}
              </Pill>
            </div>
          </div>
          <CanvasMock ready={ready} paused={!playing} />
        </div>
        <LogoStrip playing={playing} onPlayingChange={setPlaying} />
      </section>
    </>
  );
}
