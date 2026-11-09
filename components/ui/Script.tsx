import type { ScriptHTMLAttributes } from "react";

/*
 * `next/script` as a plain <script> (tanstack-migration). afterInteractive and
 * lazyOnload become async; inline scripts render as written.
 */
type NextScriptProps = ScriptHTMLAttributes<HTMLScriptElement> & {
  strategy?: "beforeInteractive" | "afterInteractive" | "lazyOnload" | "worker";
  onReady?: () => void;
};

export default function Script({ strategy, onReady: _onReady, src, ...rest }: NextScriptProps) {
  const async = src && strategy !== "beforeInteractive" ? true : undefined;
  return <script src={src} async={async} {...rest} />;
}
