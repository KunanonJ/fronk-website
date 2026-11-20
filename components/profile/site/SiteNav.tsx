import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import {
  PhoneMenu,
  PhoneMenuButton,
} from "@/components/profile/site/PhoneMenu";
import { ProfileLink } from "@/components/profile/site/ProfileLink";
import {
  SayHelloPanel,
  SayHelloTrigger,
} from "@/components/profile/site/SayHello";
import { ThemeToggle } from "@/components/profile/site/ThemeToggle";
import { SearchTrigger } from "@/components/profile/site/search/SearchTrigger";
import {
  POPOVER_IDS,
  closePopover,
  isPopoverOpen,
} from "@/components/profile/site/popover";
import { navAway, type NavScroll } from "@/components/profile/site/navAway";
import { useScrollspy } from "@/components/profile/site/scrollspy";
import {
  HOME_SECTIONS,
  brand,
  currentOf,
  homeHref,
  profileNav,
} from "@/lib/content/profileChrome";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import {
  useLocationKey,
  usePathname,
  useReplaceNavigate,
} from "@/lib/router/navigation";

/*
 * The pill nav (profile redesign, design spec 7.1 to 7.3): a fixed bar with the
 * name and the Primary links on the left, the theme toggle and Say hello on the
 * right, and the phone menu's "Menu" button under 810 px. The bar hides on
 * scroll; on Home a scrollspy marks the section in view and slides a pill under
 * its link. Everything is server-rendered, so the links work before script.
 *
 * Say hello's panel sits beside the bar's row, not in it: the row takes the
 * hide-on-scroll opacity and blur, and a panel outside the top layer would
 * inherit them.
 */

/** The path without a trailing slash, so a trailing slash is the same page. */
function normalise(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Hides the bar while the page moves down, and shows it again on the way up. */
function useHideOnScroll(bar: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    let state: NavScroll = { lastY: window.scrollY, away: false };
    let frame = 0;
    const apply = () => {
      frame = 0;
      state = navAway(state, window.scrollY);
      // An open popover keeps the bar in view; so does focus inside the bar,
      // which the stylesheet checks (:has(:focus-visible)).
      const open = Array.from(
        el.querySelectorAll<HTMLElement>("[popover]"),
      ).some(isPopoverOpen);
      if (state.away && !open) el.setAttribute("data-away", "");
      else el.removeAttribute("data-away");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    // A popover opening or closing settles the bar at once.
    el.addEventListener("toggle", schedule, true);
    return () => {
      window.removeEventListener("scroll", schedule);
      el.removeEventListener("toggle", schedule, true);
      cancelAnimationFrame(frame);
    };
  }, [bar]);
}

/** Slides the pill under the link of `section`, or hides it. */
function placePill(nav: HTMLElement, section: string | undefined) {
  const pill = nav.querySelector<HTMLElement>(".pf-nav__active");
  if (!pill) return;
  const link = section
    ? nav.querySelector<HTMLElement>(`[data-section="${section}"]`)
    : null;
  if (!link) {
    pill.removeAttribute("data-visible");
    return;
  }
  pill.style.transform = `translateX(${link.offsetLeft}px)`;
  pill.style.width = `${link.offsetWidth}px`;
  pill.setAttribute("data-visible", "");
}

/** Keeps the sliding pill under the section in view, on Home only. */
function usePill(
  links: RefObject<HTMLElement | null>,
  home: boolean,
  section: string | undefined,
) {
  useEffect(() => {
    const nav = links.current;
    if (!nav) return;
    if (!home) {
      nav.removeAttribute("data-slide");
      placePill(nav, undefined);
      return;
    }
    // With the pill in place, the static tint on aria-current is not drawn twice.
    nav.setAttribute("data-slide", "");
    const place = () => placePill(nav, section);
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [links, home, section]);
}

/** Closes every chrome popover whenever the location changes, back and forward included. */
function useCloseOnRouteChange(locationKey: string) {
  useEffect(() => {
    for (const id of Object.values(POPOVER_IDS)) closePopover(id);
  }, [locationKey]);
}

export default function SiteNav() {
  const pathname = usePathname();
  const locationKey = useLocationKey();
  const home = normalise(pathname) === normalise(homeHref());
  const bar = useRef<HTMLElement>(null);
  const links = useRef<HTMLElement>(null);
  const [spied, setSpied] = useState<string | undefined>(undefined);
  // The scrollspy's answer only means something on Home.
  const section = home ? spied : undefined;
  const replaceNavigate = useReplaceNavigate();

  useHideOnScroll(bar);
  useScrollspy(home, HOME_SECTIONS, setSpied);
  usePill(links, home, section);
  useCloseOnRouteChange(locationKey);

  const onBrand = (event: MouseEvent<HTMLAnchorElement>) => {
    // A modified click, or a button other than the primary one, is the browser's.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    // Off Home the router follows the link.
    if (!home) return;
    event.preventDefault();
    if (window.location.hash) {
      // The hash has to leave the address, and a plain scroll cannot do that.
      // The router replaces the entry with the bare path and scrolls to the top.
      replaceNavigate(brand.home);
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <header ref={bar} data-site-chrome lang="en" className="pf-nav">
      <div className="pf-nav__row">
        <div className="pf-nav__pill">
          <ProfileLink
            href={brand.home}
            aria-label={brand.label}
            className="pf-nav__name"
            onClick={onBrand}
          >
            <img
              src={brand.avatar}
              alt=""
              width={32}
              height={32}
              className="pf-nav__avatar"
            />
            <span className="pf-nav__word">
              {brand.firstName}
              <span className="pf-nav__surname"> {brand.surname}</span>
              <span className="pf-nav__dot">.</span>
            </span>
          </ProfileLink>
          <nav ref={links} aria-label="Primary" className="pf-nav__links">
            <span className="pf-nav__active" aria-hidden="true" />
            {profileNav.map((link) => (
              <ProfileLink
                key={link.label}
                href={link.href}
                data-section={link.section}
                current={currentOf(link, section, pathname)}
                className="pf-nav__link"
              >
                {link.label}
              </ProfileLink>
            ))}
          </nav>
          <PhoneMenuButton />
        </div>
        <div className="pf-nav__right">
          <SearchTrigger />
          <ThemeToggle />
          <SayHelloTrigger id={POPOVER_IDS.nav} placement="nav" />
        </div>
      </div>
      <SayHelloPanel id={POPOVER_IDS.nav} placement="nav" />
      <PhoneMenu />
    </header>
  );
}
