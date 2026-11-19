import { useState, type ReactNode } from "react";
import Link from "@/components/navigation/Link";
import { CheckIcon, CopyIcon } from "@/components/bento/icons";
import { pillClass } from "@/components/ds/Pill";
import { CatalogHero } from "@/components/profile/catalog/CatalogHero";
import { Headline } from "@/components/profile/pages/PageHero";
import { PixelArt } from "@/components/profile/site/PixelArt";
import { ProfileMain } from "@/components/profile/site/ProfileMain";
import { siteConfig } from "@/lib/site";
import { writeClipboard } from "@/lib/utils/clipboard";
import { pad2 } from "@/lib/utils/pad2";

/*
 * The 404 page and the route error state (profile redesign Phase 7f; design
 * spec 13 item 18 and 15.8): the hero on the pixel sky, then three tiles: a
 * pixel drawing of our own with the status, the recovery links and the
 * "report it" email. The copy is the live pages' own, word for word. Styles:
 * `.pf-status*` in src/styles/profile/pages-catalog.css.
 */

/** Where a lost visitor can go next (owner decision 3: Ventures is /#ventures). */
const RECOVERY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/#ventures", label: "Ventures" },
  { href: "/contact", label: "Contact" },
] as const;

export type StatusPageCopy = {
  eyebrow: string;
  /** The h1 as one line: a muted opening word, the middle, an accent end. */
  headline: { muted: string; middle: string; accent: string };
  lead: string;
  /** The status tile's heading, after the coral square. */
  status: string;
  /** The tile's pixel drawing (components/landing/statusArt.ts). */
  art: readonly string[];
  /** The email tile's heading and the subject of its mailto link. */
  report: { title: string; subject: string };
};

function RecoveryTile() {
  return (
    <article
      aria-labelledby="card-recover"
      className="ds-tile ds-tile--paper pf-status__tile"
    >
      <h2 id="card-recover" className="t-meta pf-status__kicker">
        Try one of these
      </h2>
      <nav aria-label="Recovery links" className="pf-status__links">
        {RECOVERY_LINKS.map((link, i) => (
          <Link key={link.href} href={link.href} className="pf-status__link">
            <span className="t-meta pf-status__number">{pad2(i + 1)}</span>
            {link.label}
            <span aria-hidden className="pf-status__arrow">
              →
            </span>
          </Link>
        ))}
      </nav>
    </article>
  );
}

/** The address as a mailto link, and a Copy email button that stays copied. */
function ReportTile({ title, subject }: StatusPageCopy["report"]) {
  const [copied, setCopied] = useState(false);
  const mailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}`;
  return (
    <article
      aria-labelledby="card-report"
      className="ds-tile pf-status__tile pf-status__report"
    >
      <h2 id="card-report" className="t-meta pf-status__kicker">
        {title}
      </h2>
      <div className="pf-status__mail">
        <a href={mailto} className="pf-status__address">
          {siteConfig.email}
        </a>
        <button
          type="button"
          onClick={() => {
            void writeClipboard(siteConfig.email).then(setCopied);
          }}
          className={pillClass({ variant: "ghost" })}
        >
          <span className="ds-pill__icon" aria-hidden="true">
            {copied ? <CheckIcon /> : <CopyIcon size={16} />}
          </span>
          <span aria-live="polite">
            {copied ? "Email copied" : "Copy email"}
          </span>
        </button>
      </div>
    </article>
  );
}

/**
 * The status page body. `actions` sits under the lead (RouteError's "Try
 * again"); `alert` makes the hero a live alert for an error that appears in
 * place of a page.
 */
export default function StatusPage({
  copy,
  actions,
  alert = false,
}: {
  copy: StatusPageCopy;
  actions?: ReactNode;
  alert?: boolean;
}) {
  const { headline } = copy;
  return (
    <ProfileMain className="pf-status">
      <CatalogHero
        role={alert ? "alert" : undefined}
        eyebrow={copy.eyebrow}
        title={
          <Headline
            lines={[
              [
                { text: headline.muted, tone: "muted" },
                { text: headline.middle },
                { text: headline.accent, tone: "accent" },
              ],
            ]}
          />
        }
        lead={copy.lead}
      >
        {actions ? <div className="pf-cat-hero__actions">{actions}</div> : null}
      </CatalogHero>
      <div className="ds-wrap pf-status__grid">
        <article
          aria-labelledby="card-status"
          className="ds-tile ds-tile--tint pf-status__tile pf-status__art-tile"
        >
          <h2 id="card-status" className="t-meta pf-status__kicker">
            <span aria-hidden className="pf-status__square" />
            {copy.status}
          </h2>
          <PixelArt rows={copy.art} className="pf-status__art" />
        </article>
        <RecoveryTile />
        <ReportTile {...copy.report} />
      </div>
    </ProfileMain>
  );
}
