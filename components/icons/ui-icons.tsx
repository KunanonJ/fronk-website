import type { IconComponent, IconProps } from "./types";

function StrokeIcon({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-hidden"] ?? true}
      {...props}
    >
      {children}
    </svg>
  );
}

export const GlobeIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18" />
    <path d="M12 3a14 14 0 0 0 0 18" />
  </StrokeIcon>
);

export const ArrowDownRightIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <path d="M7 7l10 10" />
    <path d="M10 17h7v-7" />
  </StrokeIcon>
);

export const MenuIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </StrokeIcon>
);

export const CloseIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </StrokeIcon>
);

export const MailIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <path d="M3 7l9 7 9-7" />
  </StrokeIcon>
);

export const SendIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <path d="M22 2L11 13" />
    <path d="M22 2l-7 20-4-9-9-4 20-7z" />
  </StrokeIcon>
);

export const HashIcon: IconComponent = (props) => (
  <StrokeIcon {...props}>
    <path d="M5 9h14" />
    <path d="M5 15h14" />
    <path d="M10 3L8 21" />
    <path d="M16 3l-2 18" />
  </StrokeIcon>
);
