import { cn } from "@/lib/utils";

export function Logo({ compact, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1" y="1" width="30" height="30" rx="10" fill="var(--card)" stroke="var(--border)" />
        <path
          d="M5 17.5h4l2.2-5.6 3 10.4 2.6-8 2 5.2h2.4"
          fill="none"
          stroke="var(--mint)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24.4" cy="14.5" r="2.6" fill="var(--salmon)" />
      </svg>
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-[15px] font-bold uppercase tracking-[0.16em]">
            WellSync
          </div>
          <div className="font-mono mt-1 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Wellness OS
          </div>
        </div>
      )}
    </div>
  );
}
