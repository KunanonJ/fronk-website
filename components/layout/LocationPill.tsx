interface LocationPillProps {
  line1?: string;
  line2?: string;
  className?: string;
}

/**
 * Wireframe globe — outer rim static, meridians spin.
 * Global prefers-reduced-motion freezes the spin.
 */
function SpinningGlobe({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <g
        className="origin-center animate-globe-spin"
        style={{ transformOrigin: "12px 12px" }}
      >
        <ellipse cx="12" cy="12" rx="3" ry="9" />
        <ellipse cx="12" cy="12" rx="6.5" ry="9" />
        <path d="M12 3v18" />
      </g>
    </svg>
  );
}

/**
 * Optional location chip — tokenized surfaces (not used on FogLAMP home hero).
 */
export function LocationPill({
  line1 = "Located in",
  line2 = "Bangkok",
  className = "",
}: LocationPillProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-r-full bg-bg py-2.5 pr-2.5 pl-4 sm:gap-4 sm:py-3 sm:pr-3 sm:pl-5 ${className}`}
    >
      <p className="text-[0.65rem] leading-tight text-fg sm:text-xs">
        {line1}
        <br />
        {line2}
      </p>
      <span
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-fg sm:h-11 sm:w-11"
        aria-hidden
      >
        <SpinningGlobe className="h-5 w-5" />
      </span>
    </div>
  );
}
