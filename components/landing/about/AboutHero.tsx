import { CtaLink } from "@/components/bento/Buttons";
import { AvailabilityPill, EyebrowChip } from "@/components/bento/Chips";
import { ArrowDownIcon } from "@/components/bento/icons";
import { GithubIcon, LinkedinIcon, XIcon } from "@/components/ui/SocialIcons";
import { aboutPage } from "@/lib/content/aboutPage";
import { OPEN_TO_ROLES } from "@/lib/content/availability";
import { socials } from "@/lib/content/landing";
import { PageTitle, HeroLead } from "@/components/bento/PageHero";

const SOCIAL_ICONS = {
  X: XIcon,
  LinkedIn: LinkedinIcon,
  GitHub: GithubIcon,
} as const satisfies Record<(typeof socials)[number]["label"], unknown>;

/**
 * About hero (bento canvas, design spec 4.2): the text column (eyebrow, the
 * three-line h1, lead, CTAs and the story jump link) beside a portrait panel
 * with the social links floating on it. The h1 is the LCP candidate with the
 * portrait: its lines only slide (`kj-lines`), and the portrait loads first.
 */
export default function AboutHero() {
  const { hero } = aboutPage;
  const { headline } = hero;

  return (
    <section aria-labelledby="hero-title" className="flex flex-wrap gap-5">
      <div className="flex min-w-0 flex-[2_1_420px] flex-col items-start justify-center gap-6 py-2">
        <EyebrowChip>
          {hero.nickname} · {hero.location}
        </EyebrowChip>
        <PageTitle>
          <span className="block">
            <span className="text-ink-3">{headline.muted}</span> {headline.name}
          </span>{" "}
          <span className="block">
            {headline.focus}{" "}
            <span className="text-ink-3">{headline.joiner}</span>
          </span>{" "}
          <span className="block text-mark">{headline.accent}</span>
        </PageTitle>
        <HeroLead>{hero.role}</HeroLead>
        <AvailabilityPill
          label={OPEN_TO_ROLES.pill.label}
          detail={OPEN_TO_ROLES.pill.detail}
        />
        <div className="flex flex-wrap items-center gap-3">
          <CtaLink href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaLink>
          <CtaLink href={hero.secondaryCta.href} variant="secondary">
            {hero.secondaryCta.label}
          </CtaLink>
          <a
            href={hero.storyHref}
            className="inline-flex min-h-11 items-center gap-2 px-2.5 text-card font-medium no-underline"
          >
            {hero.storyLabel}
            <ArrowDownIcon />
          </a>
        </div>
      </div>

      <div className="relative min-h-[440px] min-w-0 flex-[1_1_280px] overflow-hidden rounded-bento border border-hairline bg-surface-tint shadow-card">
        {/* Plain <img>: a pre-sized 480 px WebP, loaded first as a likely LCP. */}
        <img
          src={hero.portraitSrc}
          alt={hero.portraitAlt}
          width={480}
          height={480}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <ul
          aria-label="Social profiles"
          className="absolute bottom-4 left-1/2 m-0 flex -translate-x-1/2 list-none gap-1 rounded-full border border-hairline bg-surface p-[5px] shadow-pop"
        >
          {socials.map(({ label, href }) => {
            const Icon = SOCIAL_ICONS[label];
            return (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  aria-label={label}
                  className="kj-row inline-flex size-11 items-center justify-center rounded-full text-ink"
                >
                  <Icon size={18} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
