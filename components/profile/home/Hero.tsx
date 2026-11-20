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
 * reach, and keyboard focus inside it unsticks it (home-hero.css), so the
 * browser scrolls a focused control into view where it really is (WCAG
 * 2.4.11). The first facts (the h1, "Currently building", Contact me,
 * Résumé) are at the top of the copy, above the fold at 375 x 812 and
 * 1440 x 900.
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

  const onFocus = (event: FocusEvent<HTMLElement>) => {
    setFocusInside(holdsHeadline(event.target));
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
  );
}
