import type { SVGProps } from "react";

/*
 * Line icons drawn in the bento canvas (phase 7a), inline so the header ships
 * no icon library. All decorative: the control next to them has the label.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Stroke({
  size = 18,
  strokeWidth = 1.8,
  children,
  ...rest
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 15V3" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </Stroke>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Stroke>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </Stroke>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M4 8h16M8 16h12" />
    </Stroke>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Stroke>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
      <path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
    </Stroke>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Stroke strokeWidth={2} {...props}>
      <path d="M5 12l5 5L20 7" />
    </Stroke>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </Stroke>
  );
}

export function MoreIcon({ size = 18, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...rest}
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export function XLogoIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...rest}
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function LinkedInLogoIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...rest}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function ClockIcon({ size = 16, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      {...rest}
    >
      <circle cx="8" cy="8" r="6.3" />
      <path d="M8 4.6V8l2.2 1.6" />
    </svg>
  );
}

export function TempleIcon({ size = 28, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d="M16 3v4M13.6 11.5 16 7l2.4 4.5M12.4 27l1.2-15.5h4.8L19.6 27M7.5 27l.9-7.5L9.5 17l1.1 2.5.9 7.5M20.5 27l.9-7.5 1.1-2.5 1.1 2.5.9 7.5M4 27h24M14.4 20h3.2" />
    </svg>
  );
}

export function CopyIcon({ size = 16, ...props }: IconProps) {
  return (
    <Stroke size={size} {...props}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </Stroke>
  );
}

/** "Opens elsewhere" arrow for external rows and CTA links. */
export function ArrowUpRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <Stroke size={size} {...props}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </Stroke>
  );
}

export function ArrowDownIcon({ size = 16, ...props }: IconProps) {
  return (
    <Stroke size={size} {...props}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </Stroke>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Stroke {...props}>
      <path d="M12 4v11" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 20h14" />
    </Stroke>
  );
}

/** The FAQ toggle: a plus that turns into a cross when the answer opens. */
export function PlusIcon({ size = 16, ...props }: IconProps) {
  return (
    <Stroke size={size} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Stroke>
  );
}
