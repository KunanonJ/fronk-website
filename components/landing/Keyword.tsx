import type { ReactNode } from "react";

type KeywordProps = {
  tip: string;
  children: ReactNode;
  className?: string;
};

/** hpbrn-style keyword tip — CSS ::after popover via `.keyword[data-tooltip]`. */
export default function Keyword({ tip, children, className }: KeywordProps) {
  return (
    <span
      className={className ? `keyword ${className}` : "keyword"}
      data-tooltip={tip}
    >
      {children}
    </span>
  );
}
