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

/*
 * The Home hero (profile redesign, Phase 2; design spec 8.1 to 8.3, 10 and
 * 10.1): the sunset sheet with its pixel sky, the chips, the h1, the lead and
 * the two buttons, the canvas mock, and the logo strip. From 810 px the stage
 * is sticky and the sections after it slide over it; it scrolls with the
 * page until its last line is in view, so nothing in it is ever out of
 * reach. The recruiter facts (the h1, "Open to roles", Contact me, Résumé)
 * are at the top of the copy, above the fold at 375 x 812 and 1440 x 900.
 */

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

/**
 * A control focused while the next section covers the stuck stage scrolls
 * the page back until it is clear (WCAG 2.4.11).
 */
function keepClear(stage: HTMLElement, target: Element) {
  const next = stage.nextElementSibling;
  if (!next) return;
  const covered =
    target.getBoundingClientRect().bottom -
    next.getBoundingClientRect().top +
    16;
  if (covered > 16) {
    window.scrollBy({ top: -covered, behavior: "instant" });
  }
}

export default function Hero() {
  const ready = useIntroDone();
  const stage = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(true);
  const [focusInside, setFocusInside] = useState(false);
  useStageHeight(stage);

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    setFocusInside(true);
    if (stage.current) keepClear(stage.current, event.target);
  };
  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setFocusInside(false);
    }
  };

  return (
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
            <Chip>{homeHero.location}</Chip>
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
        <CanvasMock ready={ready} />
      </div>
      <LogoStrip playing={playing} onPlayingChange={setPlaying} />
    </section>
  );
}
