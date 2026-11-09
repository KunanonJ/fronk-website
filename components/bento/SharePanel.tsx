import { useEffect, useRef, useState } from "react";
import { PANEL, ROW } from "@/components/bento/classes";
import {
  CheckIcon,
  LinkIcon,
  LinkedInLogoIcon,
  MailIcon,
  MoreIcon,
  XLogoIcon,
} from "@/components/bento/icons";
import { writeClipboard } from "@/lib/utils/clipboard";
import { cn } from "@/lib/utils/cn";

export type ShareTarget = { title: string; url: string };

/** The page being shared: its head() title and canonical URL, as rendered. */
export function readShareTarget(): ShareTarget {
  const canonical = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  return {
    title: document.title,
    url: canonical?.href || window.location.href,
  };
}

/** Intent and mailto URLs for the share rows (design spec 3.2). */
export function shareLinks({ title, url }: ShareTarget) {
  const enc = encodeURIComponent;
  return {
    x: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    mail: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
  };
}

/**
 * Header share panel (bento canvas). Mounted only while open, on the client,
 * so it reads the live title and canonical URL. "Link copied" stays until the
 * panel is reopened. "More options" (the native share sheet) shows only where
 * navigator.share exists. Focus moves to the first row on open.
 */
export default function SharePanel() {
  const [target] = useState(readShareTarget);
  const [canShare] = useState(() => typeof navigator.share === "function");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const links = shareLinks(target);

  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>("button, a[href]")
      ?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      ref={ref}
      id="share-panel"
      aria-label="Share this page"
      className={cn(PANEL, "w-[340px]")}
    >
      <p className="mx-3 mt-1 text-meta text-ink-2">Share</p>
      <p className="mx-3 mt-0.5 mb-2.5 text-card leading-[1.35] font-semibold">
        {target.title}
      </p>
      <button
        type="button"
        className={ROW}
        onClick={() => {
          void writeClipboard(target.url).then((ok) => setCopied(ok));
        }}
      >
        {copied ? <CheckIcon className="text-mark" /> : <LinkIcon />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
        <span className="ml-auto max-w-[130px] truncate font-mono text-xs text-ink-2">
          {target.url.replace(/^https?:\/\//, "")}
        </span>
      </button>
      <a
        className={ROW}
        href={links.x}
        target="_blank"
        rel="noopener noreferrer"
      >
        <XLogoIcon />
        <span>Post on X</span>
      </a>
      <a
        className={ROW}
        href={links.linkedIn}
        target="_blank"
        rel="noopener noreferrer"
      >
        <LinkedInLogoIcon />
        <span>Share on LinkedIn</span>
      </a>
      <a className={ROW} href={links.mail}>
        <MailIcon />
        <span>Email the link</span>
      </a>
      {canShare ? (
        <button
          type="button"
          className={ROW}
          onClick={() => {
            navigator.share(target).catch(() => {
              // Dismissed or unsupported for this data: nothing to do.
            });
          }}
        >
          <MoreIcon />
          <span>More options</span>
        </button>
      ) : null}
    </section>
  );
}
