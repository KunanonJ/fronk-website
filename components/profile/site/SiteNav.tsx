import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from "react";
import Link from "@/components/navigation/Link";
import {
  PhoneMenu,
  PhoneMenuButton,
} from "@/components/profile/site/PhoneMenu";
import { SayHello } from "@/components/profile/site/SayHello";
import { ThemeToggle } from "@/components/profile/site/ThemeToggle";
import { isPopoverOpen } from "@/components/profile/site/popover";
import { navAway, type NavScroll } from "@/components/profile/site/navAway";
import {
  SPY_MARGIN,
  currentSection,
  type VisibleSection,
} from "@/components/profile/site/scrollspy";
import {
  HOME_SECTIONS,
  brand,
  homeHref,
  isCurrentLink,
  profileNav,
  type ChromeLink,
} from "@/lib/content/profileChrome";
import { prefersReducedMotion } from "@/lib/motion/motionRuntime";
import { usePathname } from "@/lib/router/navigation";

/*
 * The pill nav (profile redesign, design spec 7.1 to 7.3): a fixed bar with the
 * name and the Primary links on the left, the theme toggle and Say hello on the
 * right, and the phone menu's "Menu" button under 810 px. The bar hides on
 * scroll; on Home a scrollspy marks the section in view and slides a pill under
 * its link. Everything is server-rendered, so the links work before script.
 */

const SAY_HELLO_NAV = "say-hello-nav";

/** The path without a trailing slash, so "/preview/" is Home too. */
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
      // An open popover keeps the bar in view, and so does focus inside it
      // (CSS: :focus-within).
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

/** Reports the Home section in view: the topmost one the observer band holds. */
function useScrollspy(
  active: boolean,
  onSection: (section: string | undefined) => void,
) {
  useEffect(() => {
    if (!active || typeof IntersectionObserver === "undefined") return;
    const sections = HOME_SECTIONS.map((id) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.boundingClientRect.top);
          } else {
            visible.delete(entry.target.id);
          }
        }
        onSection(
          currentSection(
            [...visible].map(([id, top]): VisibleSection => ({ id, top })),
          ),
        );
      },
      { rootMargin: SPY_MARGIN, threshold: 0 },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [active, onSection]);
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

function currentOf(
  link: ChromeLink,
  section: string | undefined,
  pathname: string,
): "location" | "page" | undefined {
  if (link.section !== undefined && link.section === section) return "location";
  return isCurrentLink(link, pathname) ? "page" : undefined;
}

export default function SiteNav() {
  const pathname = usePathname();
  const home = normalise(pathname) === normalise(homeHref());
  const bar = useRef<HTMLElement>(null);
  const links = useRef<HTMLElement>(null);
  const [spied, setSpied] = useState<string | undefined>(undefined);
  // The scrollspy's answer only means something on Home.
  const section = home ? spied : undefined;

  useHideOnScroll(bar);
  useScrollspy(home, setSpied);

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
  }, [home, section]);

  const onBrand = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!home) return;
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    if (window.location.hash) {
      window.history.replaceState(window.history.state, "", homeHref());
    }
  };

  return (
    <header ref={bar} data-site-chrome lang="en" className="pf-nav">
      <div className="pf-nav__row">
        <div className="pf-nav__pill">
          <Link
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
          </Link>
          <nav ref={links} aria-label="Primary" className="pf-nav__links">
            <span className="pf-nav__active" aria-hidden="true" />
            {profileNav.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                data-section={link.section}
                aria-current={currentOf(link, section, pathname)}
                className="pf-nav__link"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <PhoneMenuButton />
        </div>
        <div className="pf-nav__right">
          <ThemeToggle />
          <SayHello id={SAY_HELLO_NAV} placement="nav" />
        </div>
      </div>
      <PhoneMenu />
    </header>
  );
}
