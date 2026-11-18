import type {
  AnchorHTMLAttributes,
  ComponentPropsWithRef,
  MouseEvent,
  ReactNode,
} from "react";
import { useChromeLinkProps } from "@/lib/router/navigation";

/*
 * A link of the profile chrome (design spec 7.1, 7.2). It navigates like the
 * router's links, and keeps none of the router's active state: the router would
 * mark a Home section link `aria-current="page"` once the page is on that hash,
 * and it would keep that mark while the reader scrolls on. `aria-current` comes
 * from the chrome alone (profileChrome.currentOf): "location" for the section
 * in view, "page" for the page itself.
 */

type RouterLinkProps = ComponentPropsWithRef<"a"> & {
  "aria-current"?: unknown;
  "data-status"?: unknown;
};

export function ProfileLink({
  href,
  current,
  onClick,
  children,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "aria-current"> & {
  href: string;
  current?: "page" | "location";
  children: ReactNode;
}) {
  const {
    "aria-current": _ariaCurrent,
    "data-status": _status,
    onClick: routerClick,
    ...link
  } = useChromeLinkProps(href) as RouterLinkProps;
  return (
    <a
      {...link}
      {...rest}
      aria-current={current}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        // The chrome may stop the router's own navigation (the name link does,
        // for a hash on Home); the router skips a click whose default is gone.
        onClick?.(event);
        routerClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
