import { brand } from "@/lib/brand/tokens";
import { DitherBand, seedFrom } from "@/lib/og/card";
import { siteConfig } from "@/lib/site";
import portrait from "./portrait.jpg?inline";

/** A headline word or phrase; `muted` ones take the secondary text colour. */
type HeadlineSegment = string | { muted: string };

export interface ProfileCardProps {
  /** The accent pill's label, for example "Open to roles". */
  pill: string;
  /** Headline lines above the accent line, as the page's hero sets them. */
  lines: readonly (readonly HeadlineSegment[])[];
  /** The last line, in the accent colour and italic. */
  accent: string;
  /** Under the headline: who he is, in a sentence or two. */
  lead: string;
}

const PORTRAIT = { width: 320, height: 400 };
/** Instrument Serif at this size fits four lines beside the portrait. */
const HEADLINE_SIZE = 60;

/**
 * The Home and About share cards (lib/og/profileCards.ts): the page's hero
 * headline beside the portrait (a 320x400 crop of /profile.jpg, bundled
 * into the Worker), over the dither band every share card carries. The
 * other pages use OgCard.
 */
export function ProfileCard({ pill, lines, accent, lead }: ProfileCardProps) {
  const domain = siteConfig.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        background: `linear-gradient(165deg, ${brand.peach} 0%, ${brand.tint2} 38%, ${brand.paper} 70%)`,
        color: brand.ink,
        fontFamily: "Onest",
      }}
    >
      <DitherBand seed={seedFrom(accent)} />

      {/* The portrait, the domain under it as a caption. */}
      <div
        style={{
          position: "absolute",
          top: 64,
          right: 72,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 16,
        }}
      >
        <img
          src={portrait}
          alt=""
          width={PORTRAIT.width}
          height={PORTRAIT.height}
          style={{ borderRadius: 28 }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: brand.inkMuted,
          }}
        >
          {domain}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 64,
          left: 72,
          width: 680,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "7px 16px",
              borderRadius: 999,
              background: brand.accent,
              color: brand.paper,
              fontSize: 19,
              fontWeight: 500,
            }}
          >
            {pill}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Instrument Serif",
              fontSize: HEADLINE_SIZE,
              lineHeight: 1,
              letterSpacing: "-0.015em",
            }}
          >
            {lines.map((line, row) => (
              <div key={row} style={{ display: "flex", gap: 15 }}>
                {line.map((segment, i) =>
                  typeof segment === "string" ? (
                    <div key={i} style={{ display: "flex" }}>
                      {segment}
                    </div>
                  ) : (
                    <div
                      key={i}
                      style={{ display: "flex", color: brand.inkMuted }}
                    >
                      {segment.muted}
                    </div>
                  ),
                )}
              </div>
            ))}
            <div
              style={{
                display: "flex",
                fontStyle: "italic",
                color: brand.accent,
              }}
            >
              {accent}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 22,
              lineHeight: 1.4,
              color: brand.inkMuted,
            }}
          >
            {lead}
          </div>
        </div>
      </div>
    </div>
  );
}
