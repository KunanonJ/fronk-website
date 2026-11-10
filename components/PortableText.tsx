import Image from "@/components/ui/Image";
import Link from "@/components/navigation/Link";
import {
  PortableText as BasePortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { urlFor } from "@/lib/sanity/client";
import type { SanityImage } from "@/lib/sanity/types";

/*
 * Post body styles (bento redesign, phase 7g). The canvas draws only
 * paragraphs (17 px, 1.7, ink, 20 px apart); the rest follows the canvas
 * system (design spec 6, gap 20):
 *   - headings: the in-card title scale. The post's card is "The note" (an
 *     h2), so Studio's H2 and H3 render as h3 and h4 under it;
 *   - lists: accent squares and mono numerals, the canvas markers;
 *   - quotes, code and images: inner wells (20 px radius, hairline, page);
 *   - links: the link colour, underlined, as in the canvas body.
 * The parent stacks the blocks with a 20 px gap.
 */

const TEXT = "text-[17px] leading-[1.7] text-ink";

const LINK =
  "text-link underline decoration-1 underline-offset-4 [overflow-wrap:anywhere] hover:text-ink";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={`m-0 ${TEXT}`}>{children}</p>,
    h2: ({ children }) => (
      <h3 className="m-0 pt-3 text-2xl leading-[1.25] font-semibold tracking-[-0.02em] text-ink">
        {children}
      </h3>
    ),
    h3: ({ children }) => (
      <h4 className="m-0 pt-1 text-xl leading-[1.3] font-semibold tracking-[-0.015em] text-ink">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="m-0 flex gap-3 rounded-well border border-hairline bg-page px-5 py-4 text-[17px] leading-[1.6] text-ink">
        <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-mark" />
        <span className="min-w-0">{children}</span>
      </blockquote>
    ),
  },
  list: {
    // role="list": Safari drops list semantics once the markers are styled away.
    bullet: ({ children }) => (
      <ul role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol role="list" className="m-0 flex list-none flex-col gap-2 p-0">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className={`flex gap-3 ${TEXT}`}>
        <span aria-hidden className="mt-[0.72em] size-1.5 shrink-0 bg-mark" />
        <span className="min-w-0">{children}</span>
      </li>
    ),
    number: ({ children, index }) => (
      <li className={`flex gap-3 ${TEXT}`}>
        {/* Screen readers already announce the position in the list. */}
        <span
          aria-hidden
          className="min-w-[2ch] shrink-0 pt-[3px] font-mono text-meta text-ink-2 tabular-nums"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0">{children}</span>
      </li>
    ),
  },
  types: {
    image: ({ value }: { value: SanityImage }) => {
      if (!value?.asset?._ref) return null;
      const src = urlFor(value).width(1600).fit("max").auto("format").url();
      return (
        <figure className="m-0 flex flex-col gap-2">
          <Image
            src={src}
            alt={value.alt ?? ""}
            width={1600}
            height={900}
            className="h-auto w-full rounded-well border border-hairline bg-surface-tint"
            sizes="(min-width: 1024px) 620px, 100vw"
          />
          {value.alt && (
            <figcaption className="px-1 text-meta text-ink-2">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
    codeBlock: ({
      value,
    }: {
      value: { code: string; language?: string; filename?: string };
    }) => (
      <figure className="m-0 overflow-hidden rounded-well border border-hairline bg-page">
        {value.filename && (
          <figcaption className="border-b border-hairline px-4 py-2.5 font-mono text-xs tracking-[0.06em] text-ink-2 uppercase">
            {value.filename}
          </figcaption>
        )}
        {/* Focusable so keyboard users can scroll a long line. */}
        <pre
          tabIndex={0}
          className="m-0 overflow-x-auto p-4 font-mono text-sm leading-[1.6] text-ink"
        >
          <code
            className={
              value.language ? `language-${value.language}` : undefined
            }
          >
            {value.code}
          </code>
        </pre>
      </figure>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded-md border border-hairline bg-page px-1.5 py-0.5 font-mono text-[0.88em]">
        {children}
      </code>
    ),
    link: ({ value, children }) => {
      const href = (value?.href ?? "") as string;
      if (!href) return <>{children}</>;
      if (/^https?:\/\//.test(href)) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={LINK}>
          {children}
        </Link>
      );
    },
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] }) {
  return <BasePortableText value={value} components={components} />;
}
