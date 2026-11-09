import Image from "@/components/ui/Image";
import Link from "@/components/navigation/Link";
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
            className="h-auto w-full border border-hairline-strong bg-surface"
            sizes="(min-width: 768px) 720px, 100vw"
          />
          {value.alt && (
            <figcaption className="mt-2 text-center text-sm text-ink-2">
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
      <div className="my-6 overflow-hidden border border-hairline-strong bg-surface">
        {value.filename && (
          <div className="border-b border-hairline-strong bg-ink/[0.04] px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-2">
            {value.filename}
          </div>
        )}
        <pre className="overflow-x-auto bg-ink/[0.04] p-4 text-sm">
          <code
            className={
              value.language ? `language-${value.language}` : undefined
            }
          >
            {value.code}
          </code>
        </pre>
      </div>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href = (value?.href ?? "") as string;
      if (!href) return <>{children}</>;
      const isExternal = /^https?:\/\//.test(href);
      const className =
        "text-ink underline decoration-ink decoration-2 underline-offset-4 hover:text-ink";
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    },
  },
};

export function PortableText({ value }: { value: PortableTextBlock[] }) {
  return <BasePortableText value={value} components={components} />;
}
