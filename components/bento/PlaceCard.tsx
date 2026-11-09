import BangkokClock from "@/components/bento/BangkokClock";
import BangkokScene from "@/components/bento/BangkokScene";
import { bentoSpan, type BentoSpan } from "@/components/bento/Bento";
import { GlassLink } from "@/components/bento/Buttons";
import { ClockIcon, TempleIcon } from "@/components/bento/icons";
import { place } from "@/lib/content/landing";
import { cn } from "@/lib/utils/cn";

/**
 * "Based in Bangkok" location card (bento canvas, design spec 3.8). A size
 * container: below 560px of card width the scene moves to the top and the
 * text sits at the bottom. The sky follows the site theme through tokens;
 * the GMT+7 clock renders on the client. All art is aria-hidden.
 */
export default function PlaceCard({
  span = 2,
  ctaHref = place.cta.href,
}: {
  span?: BentoSpan;
  ctaHref?: string;
}) {
  return (
    <article
      aria-labelledby="card-place"
      className={cn(
        "kj-place relative isolate overflow-hidden rounded-bento border border-hairline bg-water shadow-card",
        bentoSpan(span),
      )}
    >
      <div aria-hidden className="kj-place-art absolute inset-0">
        <BangkokScene />
      </div>
      <div aria-hidden className="kj-place-blur absolute inset-0" />
      <div aria-hidden className="kj-place-scrim absolute inset-0" />
      <div className="kj-place-body relative flex min-h-[420px] flex-col justify-center p-8">
        <div className="flex max-w-[360px] flex-col items-start text-on-photo">
          <span
            aria-hidden
            className="kj-badge inline-flex size-14 items-center justify-center rounded-full border border-glass-2 bg-glass backdrop-blur-[10px]"
          >
            <TempleIcon />
          </span>
          <h2
            id="card-place"
            className="mt-[22px] flex flex-col gap-0.5 font-normal"
          >
            <span className="text-2xl leading-[1.2] tracking-[-0.01em] text-on-photo-2">
              {place.before}
            </span>{" "}
            <span className="text-[clamp(2.5rem,4.6vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-on-photo">
              {place.city}
            </span>
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 text-card text-on-photo-2">
            <ClockIcon />
            <span className="kj-sr">Local time in Bangkok: </span>
            <BangkokClock timeZone={place.timeZone} /> {place.utcLabel}
          </p>
          <span
            aria-hidden
            className="my-[22px] block h-px self-stretch bg-glass-2"
          />
          <p className="text-card leading-[1.6] text-on-photo">{place.body}</p>
          <GlassLink href={ctaHref} className="mt-6">
            {place.cta.label}
          </GlassLink>
        </div>
      </div>
    </article>
  );
}
