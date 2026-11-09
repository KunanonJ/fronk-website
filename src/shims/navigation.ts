import {
  notFound as routerNotFound,
  redirect as routerRedirect,
  useLocation,
  useRouter as useTanStackRouter,
} from "@tanstack/react-router";

/* `next/navigation` on TanStack Router (tanstack-migration; removed in Phase 6). */

export function usePathname(): string {
  return useLocation({ select: (location) => location.pathname });
}

export function useSearchParams(): URLSearchParams {
  const searchStr = useLocation({ select: (location) => location.searchStr });
  return new URLSearchParams(searchStr);
}

export function useRouter() {
  const router = useTanStackRouter();
  return {
    push: (href: string) => router.navigate({ href }),
    replace: (href: string) => router.navigate({ href, replace: true }),
    back: () => router.history.back(),
    forward: () => router.history.forward(),
    refresh: () => router.invalidate(),
    prefetch: (href: string) => router.preloadRoute({ href } as never),
  };
}

export function notFound(): never {
  throw routerNotFound();
}

export function redirect(href: string): never {
  throw routerRedirect({ href, statusCode: 307 });
}

export function permanentRedirect(href: string): never {
  throw routerRedirect({ href, statusCode: 308 });
}
