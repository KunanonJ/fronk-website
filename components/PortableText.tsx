import Image from "next/image";
import Link from "next/link";
import {
  PortableText as BasePortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { urlFor } from "@/lib/sanity/client";
import type { SanityImage } from "@/lib/sanity/types";

const components: PortableTextComponents = {
  types: {
    image: ({ value }: { value: SanityImage }) => {
      if (!value?.asset?._ref) return null;
      const src = urlFor(value).width(1600).fit("max").auto("format").url();
      return (
        <figure className="my-8">
          <Image
            src={src}
            alt={value.alt ?? ""}
            width={1600}
            height={900}
            className="h-auto w-full rounded-lg border border-border"
            sizes="(min-width: 768px) 720px, 100vw"
          />
          {value.alt && (
            <figcaption className="mt-2 text-center text-sm text-muted">
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
      <div className="my-6 overflow-hidden rounded-lg border border-border">
        {value.filename && (
          <div className="border-b border-border bg-subtle px-4 py-2 font-mono text-xs text-muted">
            {value.filename}
          </div>
        )}
        <pre className="overflow-x-auto bg-subtle p-4 text-sm">
          <code className={value.language ? `language-${value.language}` : undefined}>
            {value.code}
          </code>
        </pre>
      </div>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href = (value?.href ?? "") as string;
      const isExternal = /^https?:\/\//.test(href);
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className="text-accent hover:underline">
          {children}
        </Link>
      );
    },
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] }) {
  return <BasePortableText value={value} components={components} />;
}
