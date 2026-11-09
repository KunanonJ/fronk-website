import type { ReactNode } from "react";
import type { PortfolioMockup as Mockup } from "@/lib/content/portfolio";

/**
 * Illustrative product mockups drawn as SVG (640×400, 16:10). Theme tokens
 * only, so they follow light and dark mode. Placeholder bars and generic
 * labels, never real data.
 */

const W = 640;
const H = 400;

function Bar({
  x,
  y,
  w,
  h = 7,
  tone = "fill-ink/15",
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  tone?: string;
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} className={tone} />;
}

function Label({
  x,
  y,
  children,
  size = 12,
  weight = 400,
  tone = "fill-ink/75",
  anchor = "start",
  caps = false,
}: {
  x: number;
  y: number;
  children: ReactNode;
  size?: number;
  weight?: number;
  tone?: string;
  anchor?: "start" | "middle" | "end";
  caps?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      letterSpacing={caps ? 1.2 : undefined}
      className={tone}
    >
      {caps && typeof children === "string" ? children.toUpperCase() : children}
    </text>
  );
}

function WindowFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <rect
        x={0.5}
        y={0.5}
        width={W - 1}
        height={H - 1}
        rx={14}
        className="fill-surface stroke-ink/15"
      />
      <path
        d={`M0.5 14.5 A14 14 0 0 1 14.5 0.5 H${W - 14.5} A14 14 0 0 1 ${W - 0.5} 14.5 V32 H0.5 Z`}
        className="fill-ink/[0.05]"
      />
      <line x1={0.5} y1={32} x2={W - 0.5} y2={32} className="stroke-ink/10" />
      {[20, 34, 48].map((cx) => (
        <circle key={cx} cx={cx} cy={16} r={4} className="fill-ink/25" />
      ))}
      <Label x={W / 2} y={20} size={11} anchor="middle" tone="fill-ink/70">
        {title}
      </Label>
      {children}
    </>
  );
}

function AppShell({ mockup }: { mockup: Extract<Mockup, { kind: "app-shell" }> }) {
  const tileX = [176, 406];
  const tileY = [106, 254];
  const chart = [
    [24, 36, 18, 42, 30],
    [30, 20, 38, 26, 44],
    [16, 28, 40, 34, 22],
    [36, 24, 30, 18, 40],
  ];
  return (
    <WindowFrame title={mockup.title}>
      <rect x={0.5} y={32} width={150} height={H - 32.5} className="fill-ink/[0.03]" />
      <line x1={150.5} y1={32} x2={150.5} y2={H - 0.5} className="stroke-ink/10" />
      <circle cx={24} cy={58} r={8} className="fill-ink/20" />
      <Label x={40} y={62} size={13} weight={600} tone="fill-ink">
        {mockup.title}
      </Label>
      {mockup.nav.map((item, i) => {
        const y = 96 + i * 30;
        return (
          <g key={item}>
            {i === 0 ? (
              <rect x={10} y={y - 17} width={130} height={26} rx={7} className="fill-signal/10" />
            ) : null}
            <rect x={20} y={y - 10} width={10} height={10} rx={2} className={i === 0 ? "fill-signal" : "fill-ink/30"} />
            <Label x={38} y={y} size={12} tone={i === 0 ? "fill-ink" : "fill-ink/75"}>
              {item}
            </Label>
          </g>
        );
      })}

      <Label x={176} y={70} size={18} weight={600} tone="fill-ink">
        {mockup.nav[0] ?? "Dashboard"}
      </Label>
      <Bar x={176} y={82} w={180} tone="fill-ink/12" />
      <rect x={420} y={52} width={160} height={24} rx={12} className="fill-ink/[0.05] stroke-ink/10" />
      <circle cx={604} cy={64} r={12} className="fill-ink/15" />

      {mockup.tiles.slice(0, 4).map((tile, i) => {
        const x = tileX[i % 2]!;
        const y = tileY[Math.floor(i / 2)]!;
        return (
          <g key={tile}>
            <rect x={x} y={y} width={210} height={128} rx={12} className="fill-ink/[0.03] stroke-ink/12" />
            <Label x={x + 16} y={y + 28} size={12} tone="fill-ink/85">
              {tile}
            </Label>
            <Bar x={x + 16} y={y + 40} w={110} h={6} tone="fill-ink/14" />
            {chart[i]!.map((h, k) => (
              <rect
                key={k}
                x={x + 16 + k * 22}
                y={y + 112 - h}
                width={12}
                height={h}
                rx={2}
                className="fill-ink/20"
              />
            ))}
            <Bar x={x + 140} y={y + 100} w={54} h={6} tone="fill-ink/10" />
          </g>
        );
      })}
    </WindowFrame>
  );
}

function EmailReport({ mockup }: { mockup: Extract<Mockup, { kind: "email-report" }> }) {
  const colX = [24, 210, 350, 480];
  const runway = [0.7, 0.55, 0.85, 0.6, 0.75];
  return (
    <WindowFrame title="Inbox">
      <circle cx={36} cy={62} r={14} className="fill-ink/15" />
      <Bar x={60} y={52} w={140} h={8} tone="fill-ink/18" />
      <Bar x={60} y={66} w={96} tone="fill-ink/10" />
      <Bar x={540} y={52} w={72} tone="fill-ink/10" />
      <Label x={24} y={104} size={17} weight={600} tone="fill-ink">
        {mockup.subject}
      </Label>

      <rect x={24} y={118} width={592} height={38} rx={8} className="fill-success/15" />
      <circle cx={46} cy={137} r={9} className="fill-success" />
      <path d="M41.5 137.5 L45 141 L51 133.5" className="fill-none stroke-surface" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Label x={64} y={141} size={13} weight={600} tone="fill-success">
        {mockup.status}
      </Label>

      {mockup.columns.map((col, i) => (
        <Label key={col} x={colX[i]!} y={184} size={10} tone="fill-ink/70" caps>
          {col}
        </Label>
      ))}
      <line x1={24} y1={194} x2={616} y2={194} className="stroke-ink/12" />
      {runway.map((r, i) => {
        const y = 204 + i * 36;
        return (
          <g key={i}>
            <circle cx={32} cy={y + 18} r={5} className="fill-ink/20" />
            <Bar x={44} y={y + 14} w={110} h={8} tone="fill-ink/16" />
            <Bar x={210} y={y + 14} w={70} h={8} tone="fill-ink/14" />
            <rect x={350} y={y + 15} width={90} height={6} rx={3} className="fill-ink/10" />
            <rect x={350} y={y + 15} width={90 * r} height={6} rx={3} className="fill-ink/35" />
            <rect x={480} y={y + 9} width={46} height={18} rx={9} className="fill-success/15" />
            <Label x={503} y={y + 22} size={10} weight={600} anchor="middle" tone="fill-success">
              OK
            </Label>
            <line x1={24} y1={y + 36} x2={616} y2={y + 36} className="stroke-ink/[0.06]" />
          </g>
        );
      })}
    </WindowFrame>
  );
}

function FormPreview({ mockup }: { mockup: Extract<Mockup, { kind: "form-preview" }> }) {
  const placeholder = [150, 120, 190, 110, 140];
  const contacts = [150, 120, 170];
  return (
    <WindowFrame title="Signature generator">
      <Label x={24} y={66} size={14} weight={600} tone="fill-ink">
        Your details
      </Label>
      {mockup.fields.slice(0, 5).map((field, i) => {
        const y = 84 + i * 52;
        return (
          <g key={field}>
            <Label x={24} y={y + 10} size={10} tone="fill-ink/70">
              {field}
            </Label>
            <rect x={24} y={y + 16} width={270} height={26} rx={6} className="fill-ink/[0.03] stroke-ink/15" />
            <Bar x={34} y={y + 26} w={placeholder[i] ?? 120} h={6} tone="fill-ink/15" />
            {i === mockup.fields.length - 1 ? (
              <path d={`M274 ${y + 26} l5 5 l5 -5`} className="fill-none stroke-ink/50" strokeWidth={1.5} />
            ) : null}
          </g>
        );
      })}

      <line x1={318} y1={48} x2={318} y2={384} className="stroke-ink/10" />
      <Label x={342} y={66} size={10} tone="fill-ink/70" caps>
        Preview
      </Label>
      <rect x={342} y={80} width={274} height={176} rx={10} className="fill-ink/[0.02] stroke-ink/12" />
      <rect x={360} y={100} width={44} height={44} rx={8} className="fill-ink/15" />
      <Label x={418} y={116} size={15} weight={600} tone="fill-ink">
        Your Name
      </Label>
      <Bar x={418} y={126} w={110} tone="fill-ink/18" />
      <Bar x={418} y={138} w={80} tone="fill-ink/12" />
      <line x1={360} y1={162} x2={598} y2={162} className="stroke-ink/10" />
      {contacts.map((w, i) => (
        <g key={i}>
          <circle cx={364} cy={180 + i * 18} r={4} className="fill-ink/25" />
          <Bar x={376} y={177 + i * 18} w={w} h={6} tone="fill-ink/14" />
        </g>
      ))}
      {[364, 382, 400].map((cx) => (
        <circle key={cx} cx={cx} cy={240} r={6} className="fill-ink/20" />
      ))}

      <rect x={342} y={280} width={274} height={36} rx={18} className="fill-signal" />
      <Label x={479} y={303} size={13} weight={600} anchor="middle" tone="fill-paper">
        {mockup.action}
      </Label>
      <Label x={479} y={336} size={10} anchor="middle" tone="fill-ink/70">
        Rich text + plain-text fallback
      </Label>
    </WindowFrame>
  );
}

function ReviewQueue({ mockup }: { mockup: Extract<Mockup, { kind: "review-queue" }> }) {
  const colEdges = [24, 52, 172, 420, 528, 616];
  const titleW = [200, 170, 215, 150, 190];
  const subW = [120, 140, 100, 130, 110];
  const score = [0.92, 0.78, 0.86, 0.64, 0.9];
  const approved = [true, true, false, true, false];
  return (
    <WindowFrame title="Spreadsheet">
      <Label x={24} y={64} size={15} weight={600} tone="fill-ink">
        {mockup.title}
      </Label>
      <rect x={440} y={48} width={80} height={24} rx={12} className="fill-ink/[0.05] stroke-ink/12" />
      <Bar x={456} y={57} w={48} h={6} tone="fill-ink/20" />
      <rect x={528} y={48} width={88} height={24} rx={12} className="fill-ink/[0.05] stroke-ink/12" />
      <Bar x={544} y={57} w={56} h={6} tone="fill-ink/20" />

      <rect x={24} y={84} width={592} height={28} className="fill-ink/[0.04]" />
      {mockup.columns.slice(0, 4).map((col, i) => (
        <Label key={col} x={colEdges[i + 1]! + 10} y={102} size={10} tone="fill-ink/75" caps>
          {col}
        </Label>
      ))}
      <rect x={24} y={84} width={592} height={300} className="fill-none stroke-ink/12" />
      {colEdges.slice(1, -1).map((x) => (
        <line key={x} x1={x} y1={84} x2={x} y2={384} className="stroke-ink/10" />
      ))}
      {approved.map((ok, i) => {
        const y = 112 + i * 54;
        return (
          <g key={i}>
            <line x1={24} y1={y} x2={616} y2={y} className="stroke-ink/10" />
            <Label x={38} y={y + 31} size={10} anchor="middle" tone="fill-ink/60">
              {i + 1}
            </Label>
            <rect x={62} y={y + 9} width={64} height={36} rx={4} className="fill-ink/15" />
            <path d={`M90 ${y + 20} L101 ${y + 27} L90 ${y + 34} Z`} className="fill-ink/45" />
            <Bar x={184} y={y + 17} w={titleW[i]!} tone="fill-ink/18" />
            <Bar x={184} y={y + 31} w={subW[i]!} h={6} tone="fill-ink/10" />
            <rect x={432} y={y + 24} width={84} height={6} rx={3} className="fill-ink/10" />
            <rect x={432} y={y + 24} width={84 * score[i]!} height={6} rx={3} className="fill-ink/35" />
            {ok ? (
              <>
                <rect x={563} y={y + 18} width={18} height={18} rx={4} className="fill-success" />
                <path
                  d={`M567.5 ${y + 27} L571 ${y + 30.5} L577 ${y + 23.5}`}
                  className="fill-none stroke-surface"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : (
              <rect x={563.5} y={y + 18.5} width={17} height={17} rx={4} className="fill-none stroke-ink/40" />
            )}
          </g>
        );
      })}
    </WindowFrame>
  );
}

type PortfolioMockupProps = {
  mockup: Mockup;
  /** Accessible name; omit for decorative use (e.g. on cards next to the title). */
  label?: string;
  className?: string;
};

export default function PortfolioMockup({ mockup, label, className = "" }: PortfolioMockupProps) {
  const decorative = !label;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={`block h-auto w-full ${className}`}
      role={decorative ? undefined : "img"}
      aria-label={label}
      aria-hidden={decorative ? "true" : undefined}
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      {mockup.kind === "app-shell" ? <AppShell mockup={mockup} /> : null}
      {mockup.kind === "email-report" ? <EmailReport mockup={mockup} /> : null}
      {mockup.kind === "form-preview" ? <FormPreview mockup={mockup} /> : null}
      {mockup.kind === "review-queue" ? <ReviewQueue mockup={mockup} /> : null}
    </svg>
  );
}

/** Soft backdrop that frames a mockup like a product shot. */
export function MockupStage({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(120% 90% at 0% 0%, color-mix(in srgb, var(--palette-signal) 12%, transparent), transparent 60%), linear-gradient(180deg, var(--surface-tint), color-mix(in srgb, var(--surface-warm) 55%, var(--surface-tint)))",
      }}
    >
      {children}
    </div>
  );
}
