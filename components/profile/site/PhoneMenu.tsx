import Link from "@/components/navigation/Link";
import { ThemeSwitch } from "@/components/profile/site/ThemeSwitch";
import { closePopover, usePopover } from "@/components/profile/site/popover";
import {
  isCurrentLink,
  menuCopy,
  profileMenu,
} from "@/lib/content/profileChrome";
import { usePathname } from "@/lib/router/navigation";

/*
 * The phone menu (profile redesign, design spec 7.6): under 810 px, a text
 * button "Menu" in the nav opens a card with the six links and the theme
 * switch. Native popover like Say hello, so it works before hydration; script
 * moves focus, sets the button's names and closes it after a link.
 */

const MENU_ID = "site-menu";

/** The nav's "Menu" button. Its names change with the menu, by script. */
export function PhoneMenuButton() {
  return (
    <button
      type="button"
      popoverTarget={MENU_ID}
      aria-controls={MENU_ID}
      aria-expanded="false"
      aria-label={menuCopy.openName}
      className="pf-nav__menu"
    >
      <span className="pf-nav__menu-open">{menuCopy.open}</span>
      <span className="pf-nav__menu-close">{menuCopy.close}</span>
    </button>
  );
}

export function PhoneMenu() {
  const pathname = usePathname();
  usePopover(MENU_ID, {
    names: { open: menuCopy.closeName, closed: menuCopy.openName },
  });
  const close = () => closePopover(MENU_ID);
  return (
    <nav
      id={MENU_ID}
      aria-label={menuCopy.label}
      popover="auto"
      className="pf-menu"
    >
      <ul className="pf-menu__list">
        {profileMenu.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="pf-menu__link"
              aria-current={isCurrentLink(link, pathname) ? "page" : undefined}
              onClick={close}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="pf-menu__sep">
        <ThemeSwitch />
      </div>
    </nav>
  );
}
