import { useState, useSyncExternalStore } from "react";
import { ROW } from "@/components/bento/classes";
import {
  CheckIcon,
  LinkIcon,
  LinkedInLogoIcon,
  MailIcon,
  MoreIcon,
  XLogoIcon,
} from "@/components/bento/icons";
import { writeClipboard } from "@/lib/utils/clipboard";

export type ShareTarget = { title: string; url: string };

/** Intent and mailto URLs for the share rows (design spec 3.2). */
export function shareLinks({ title, url }: ShareTarget) {
  const enc = encodeURIComponent;
  return {
    x: `https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`,
    linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    mail: `mailto:?subject=${enc(title)}&body=${enc(url)}`,
  };
}

/** The URL without its scheme, as the rows label it. */
export function shareUrlLabel(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

const noSubscription = () => () => {};

/**
 * Whether the native share sheet exists. False on the server and during
 * hydration, so server-rendered share rows match the first client render.
 */
export function useCanShare(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => typeof navigator.share === "function",
    () => false,
  );
}

/**
 * The share actions (header share panel, Résumé share card): Copy link,
 * X, LinkedIn, email, and the native sheet where it exists. "Link copied"
 * stays until the rows remount. `showUrl` labels the copy row with the URL.
 */
export default function ShareRows({
  target,
  showUrl = false,
}: {
  target: ShareTarget;
  showUrl?: boolean;
}) {
  const canShare = useCanShare();
  const [copied, setCopied] = useState(false);
  const links = shareLinks(target);

  return (
    <>
      <button
        type="button"
        className={ROW}
        onClick={() => {
          void writeClipboard(target.url).then((ok) => setCopied(ok));
        }}
      >
        {copied ? <CheckIcon className="text-mark" /> : <LinkIcon />}
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
        {showUrl ? (
          <span className="ml-auto max-w-[130px] truncate font-mono text-xs text-ink-2">
            {shareUrlLabel(target.url)}
          </span>
        ) : null}
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
    </>
  );
}
