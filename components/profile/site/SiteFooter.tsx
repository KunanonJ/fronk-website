import { lazy, Suspense } from "react";
import Link from "@/components/navigation/Link";
import { DitherField } from "@/components/ds/DitherField";
import { EyebrowRow, StatusDot } from "@/components/ds/labels";
import { Reveal } from "@/components/ds/Reveal";
import { LocalTime } from "@/components/profile/site/LocalTime";
import { PixelArt } from "@/components/profile/site/PixelArt";
import { BROWSER_ART, PHONE_ART } from "@/components/profile/site/footerArt";
import { SayHello } from "@/components/profile/site/SayHello";
import { POPOVER_IDS, useHydrated } from "@/components/profile/site/popover";
import {
  availability,
  brand,
  copyright,
  footerCopy,
  footerLinks,
  footerPages,
  nowLine,
} from "@/lib/content/profileChrome";

/*
 * The footer (profile redesign, design spec 7.7): the sheet and its dither
 * field, a centred call to action with Say hello, and the card with the name,
 * the Pages list (every page the old menu linked), Elsewhere and For agents.
 * The name block ends with the "Now" line: what he is doing, then the place
 * with its time once the page runs (LocalTime).
 * Identical on every page. The two pixel drawings are code-drawn and shown from
 * 1280 px only; each plays once as it comes into view (PixelArt `play`), and
 * the dither field prints in (DitherField).
 *
 * The living status (now-building-and-genz Phase 5) is a lazy chunk, loaded
 * once the page runs: a guess at what he is doing beside the clock, and the
 * ship log (the latest commit on main) under the Now line. The server and
 * hydration draw neither, so a page's HTML and first load are as they were.
 */

const Living = lazy(() => import("@/components/profile/site/living/Living"));

export default function SiteFooter() {
  const hydrated = useHydrated();
  return (
    <footer data-site-chrome lang="en" className="pf-footer">
      <div className="pf-footer__sheet" aria-hidden="true">
        <DitherField className="pf-footer__dither" fade="up" cell={10} />
      </div>
      <div className="ds-wrap pf-footer__wrap">
        <div className="pf-footer__intro">
          <Reveal rise={12}>
            <EyebrowRow centred>{footerCopy.eyebrow}</EyebrowRow>
          </Reveal>
          <Reveal rise={12}>
            <h2 className="t-footer pf-footer__headline">
              {footerCopy.headline}
            </h2>
          </Reveal>
          <Reveal rise={12}>
            <div className="pf-footer__lead">
              <p>{footerCopy.paragraphs[0]}</p>
              <p className="pf-footer__last">{footerCopy.paragraphs[1]}</p>
            </div>
          </Reveal>
          <Reveal rise={12}>
            <div className="pf-footer__cta">
              <SayHello id={POPOVER_IDS.footer} placement="footer" />
            </div>
          </Reveal>
        </div>
        <Reveal rise={12}>
          <div className="pf-footer__card">
            <div className="pf-footer__name-block">
              <p className="pf-footer__name">
                {brand.firstName} {brand.surname}
                <span className="pf-nav__dot">.</span>
              </p>
              <p className="pf-footer__status">
                <StatusDot plain />
                {availability.label}
              </p>
              <p className="pf-footer__status">
                {nowLine.label} {nowLine.doing}
              </p>
              {hydrated && (
                <Suspense fallback={null}>
                  <Living />
                </Suspense>
              )}
              <p className="pf-footer__status">
                {availability.location}
                <LocalTime
                  timeZone={availability.timeZone}
                  className="pf-footer__time"
                >
                  {(hour) => (
                    <Suspense fallback={null}>
                      <Living hour={hour} />
                    </Suspense>
                  )}
                </LocalTime>
              </p>
            </div>
            <nav
              aria-label={footerLinks.pages}
              className="pf-footer__block pf-footer__block--pages"
            >
              <p className="t-meta pf-footer__label">{footerLinks.pages}</p>
              <ul className="pf-footer__list">
                {footerPages.map((page) => (
                  <li key={page.href}>
                    <Link href={page.href} className="pf-footer__link">
                      {page.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="pf-footer__side">
              <nav
                aria-label={footerLinks.elsewhere}
                className="pf-footer__block"
              >
                <p className="t-meta pf-footer__label">
                  {footerLinks.elsewhere}
                </p>
                <ul className="pf-footer__list">
                  {footerLinks.elsewhereLinks.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener"
                        className="pf-footer__link"
                      >
                        {item.label}{" "}
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav
                aria-label={footerLinks.agents.label}
                className="pf-footer__block"
              >
                <p className="t-meta pf-footer__label">
                  {footerLinks.agents.label}
                </p>
                <ul className="pf-footer__list">
                  {footerLinks.agents.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="pf-footer__link">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </Reveal>
        <p className="t-meta pf-footer__copyright" suppressHydrationWarning>
          {copyright(new Date().getFullYear())}
        </p>
        <PixelArt
          className="pf-footer__art pf-footer__art--browser"
          rows={BROWSER_ART}
          play
        />
        <PixelArt
          className="pf-footer__art pf-footer__art--phone"
          rows={PHONE_ART}
          play
        />
      </div>
    </footer>
  );
}
