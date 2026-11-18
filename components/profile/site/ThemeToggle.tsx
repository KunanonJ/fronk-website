import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/bento/icons";
import { useHydrated } from "@/components/profile/site/popover";
import { switchTheme } from "@/components/profile/site/themeTransition";
import { themeCopy } from "@/lib/content/profileChrome";

/*
 * The theme toggle in the nav, from 810 px (design spec 7.5): a 48 px round
 * button that names the theme it switches to. CSS picks the icon from the
 * `dark` class on <html>, so the right icon shows before hydration too.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  // Before hydration the label matches the server's default (light).
  const dark = hydrated && resolvedTheme === "dark";
  const label = dark ? themeCopy.toDay : themeCopy.toNight;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="pf-theme-toggle"
      onClick={() => switchTheme(dark ? "light" : "dark", setTheme)}
    >
      <span className="pf-theme-toggle__glyph" aria-hidden="true">
        <MoonIcon
          size={18}
          className="pf-theme-toggle__icon pf-theme-toggle__icon--moon"
        />
        <SunIcon
          size={18}
          className="pf-theme-toggle__icon pf-theme-toggle__icon--sun"
        />
      </span>
    </button>
  );
}
