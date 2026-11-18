import { ProfileLink } from "@/components/profile/site/ProfileLink";
import { ThemeSwitch } from "@/components/profile/site/ThemeSwitch";
import {
  POPOVER_IDS,
  closePopover,
  usePopover,
} from "@/components/profile/site/popover";
import { currentOf, menuCopy, profileMenu } from "@/lib/content/profileChrome";
import { usePathname } from "@/lib/router/navigation";

/*
 * The phone menu (profile redesign, design spec 7.6): under 810 px, a text
 * button "Menu" in the nav opens a card with the six links and the theme
 * switch. Native popover like Say hello, so it works before hydration. Script
 * moves focus, sets the button's names and closes the card after a link; the
 * "Close" label shows without script through the popover's :popover-open state.
 */

/** The nav's "Menu" button. Its names and state are written by script. */
export function PhoneMenuButton() {
  return (
    <button
      type="button"
      popoverTarget={POPOVER_IDS.menu}
      aria-controls={POPOVER_IDS.menu}
      className="pf-nav__menu"
    >
      <span className="pf-nav__menu-open">{menuCopy.open}</span>
      <span className="pf-nav__menu-close">{menuCopy.close}</span>
    </button>
  );
}

/**
 * The card. Its links carry only the page mark: the Home section mark belongs to
 * the Primary links, so the header has one section mark, not two.
 */
export function PhoneMenu() {
  const pathname = usePathname();
  usePopover(POPOVER_IDS.menu, {
    names: { open: menuCopy.closeName, closed: menuCopy.openName },
  });
  const close = () => closePopover(POPOVER_IDS.menu);
  return (
    <nav
      id={POPOVER_IDS.menu}
      aria-label={menuCopy.label}
      popover="auto"
      className="pf-menu"
    >
      <ul className="pf-menu__list">
        {profileMenu.map((link) => (
          <li key={link.label}>
            <ProfileLink
              href={link.href}
              current={currentOf(link, undefined, pathname)}
              className="pf-menu__link"
              onClick={close}
            >
              {link.label}
            </ProfileLink>
          </li>
        ))}
      </ul>
      <div className="pf-menu__sep">
        <ThemeSwitch />
      </div>
    </nav>
  );
}
