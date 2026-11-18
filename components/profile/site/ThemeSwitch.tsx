import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@/components/bento/icons";
import { useHydrated } from "@/components/profile/site/popover";
import { switchTheme } from "@/components/profile/site/themeTransition";
import { themeCopy } from "@/lib/content/profileChrome";

/*
 * The theme switch in the phone menu (design spec 7.5): two native radio
 * inputs in a fieldset with a visually hidden legend, so the arrow keys and the
 * "1 of 2" announcements come from the browser. Light is the server's default.
 */
export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const dark = hydrated && resolvedTheme === "dark";
  return (
    <fieldset className="pf-theme" data-mode={dark ? "dark" : "light"}>
      <legend className="sr-only">{themeCopy.legend}</legend>
      <span className="pf-theme__thumb" aria-hidden="true" />
      <label className="pf-theme__option">
        <input
          type="radio"
          name="profile-theme"
          value="light"
          className="pf-theme__input"
          checked={!dark}
          onChange={() => switchTheme("light", setTheme)}
        />
        <SunIcon size={17} />
        <span>{themeCopy.light}</span>
      </label>
      <label className="pf-theme__option">
        <input
          type="radio"
          name="profile-theme"
          value="dark"
          className="pf-theme__input"
          checked={dark}
          onChange={() => switchTheme("dark", setTheme)}
        />
        <MoonIcon size={17} />
        <span>{themeCopy.dark}</span>
      </label>
    </fieldset>
  );
}
