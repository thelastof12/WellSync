import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("font-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground", className)}>
      {children}
    </div>
  );
}

export function PageTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold uppercase tracking-[0.02em] sm:text-3xl">
        {children}
      </h1>
      {sub ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  action,
  accent,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  accent?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border bg-card p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {(title || action) && (
        <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <div
              className="font-display truncate text-[11px] uppercase tracking-[0.1em]"
              style={{ color: accent ?? "var(--muted-foreground)" }}
            >
              {title}
            </div>
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  unit,
  accent,
  foot,
  icon,
  progress,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: string;
  foot?: ReactNode;
  icon?: ReactNode;
  progress?: number;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <div
          className="font-display text-[11px] uppercase tracking-[0.1em]"
          style={{ color: accent ?? "var(--muted-foreground)" }}
        >
          {label}
        </div>
        {icon ? <span style={{ color: accent }}>{icon}</span> : null}
      </div>
      <div className="font-display mt-2 text-3xl font-bold leading-none">
        {value}
        {unit ? <span className="font-mono ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </div>
      {typeof progress === "number" ? (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(2, Math.min(100, progress))}%`,
              background: accent ?? "var(--mint)",
            }}
          />
        </div>
      ) : null}
      {foot ? <div className="font-mono mt-3 text-[11px] text-muted-foreground">{foot}</div> : null}
    </div>
  );
}

export function Ring({
  value,
  size = 96,
  stroke = 9,
  color = "var(--mint)",
  label,
  glow = true,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
  glow?: boolean;
}) {
  const r = (size - stroke) / 2 - 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={glow ? { filter: `drop-shadow(0 0 12px color-mix(in oklab, ${color} 45%, transparent))` } : undefined}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--raised)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * pct) / 100}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="font-display"
        fontWeight={700}
        fontSize={size / 4.4}
        fill="var(--foreground)"
      >
        {label ?? `${pct}%`}
      </text>
    </svg>
  );
}

export function Pill({
  children,
  color = "var(--mint)",
  solid,
}: {
  children: ReactNode;
  color?: string;
  solid?: boolean;
}) {
  return (
    <span
      className="font-mono inline-block rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide"
      style={
        solid
          ? { background: color, color: "var(--background)" }
          : {
              color,
              background: `color-mix(in oklab, ${color} 14%, transparent)`,
              border: `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
            }
      }
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="font-display text-sm uppercase tracking-[0.1em]">{title}</div>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{hint}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs leading-relaxed text-muted-foreground", className)}>
      This application provides wellness insights for informational purposes and is not a substitute
      for professional medical advice, diagnosis, or treatment.
    </p>
  );
}
