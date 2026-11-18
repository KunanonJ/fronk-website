import { Marquee } from "@/components/ds/Marquee";
import { logoStrip } from "@/lib/content/home";

/*
 * The logo strip (profile redesign, design spec 8.3; umbrella input R6): a
 * centred eyebrow, then the organisations as typographic wordmarks in the
 * Marquee primitive, which moves only after hydration and only with its
 * pause control. The hero owns the play state, so the same toggle also holds
 * the headline still.
 */
export function LogoStrip({
  playing,
  onPlayingChange,
}: {
  playing: boolean;
  onPlayingChange: (playing: boolean) => void;
}) {
  return (
    <div className="pf-logos ds-wrap">
      <p className="t-meta pf-logos__label">{logoStrip.label}</p>
      <Marquee
        label={logoStrip.label}
        items={logoStrip.names}
        getKey={(name) => name}
        renderItem={(name) => name}
        itemClassName="pf-logos__name"
        className="pf-logos__row"
        playing={playing}
        onPlayingChange={onPlayingChange}
      />
    </div>
  );
}
