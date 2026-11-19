import { useNavigationPending } from "@/lib/router/navigation";
import { useHydrated } from "@/components/profile/site/popover";

/*
 * A 2 px line at the top of the screen while a navigation loads (polish
 * pass, F5): the request-rendered pages (the blog, a post) fetch their data
 * before they show. It appears only after 150 ms, so a quick change never
 * flashes it, and grows towards 90 % while the page loads; under reduced
 * motion it is a still line. The delay and the growth are CSS
 * (`.pf-progress` in src/styles/profile/shell.css), so no timer runs here.
 * The state is only written once hydrated: the server and the first client
 * render both draw it idle. Decoration for sighted readers; screen readers
 * hear the new page itself.
 */
export function NavProgress() {
  const pending = useNavigationPending();
  const hydrated = useHydrated();
  return (
    <div
      className="pf-progress"
      data-pending={hydrated && pending ? "" : undefined}
      aria-hidden="true"
    />
  );
}
