import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Disclaimer, Panel, Pill } from "@/components/health/primitives";
import { TrendLine } from "@/components/health/charts";
import { useHealthStore } from "@/lib/health-store";
import { correlation, correlationStrength, trendSeries, type Range } from "@/lib/health-selectors";

export const Route = createFileRoute("/app/connections")({
  head: () => ({
    meta: [
      { title: "Health Connections — WellSync" },
      { name: "description", content: "See how sleep, activity, nutrition, mood and habits influence one another." },
      { property: "og:title", content: "Health Connections — WellSync" },
      { property: "og:description", content: "Cross-domain correlations discovered in your own data." },
    ],
  }),
  component: ConnectionsPage,
});

const PAIRS = [
  { a: "sleep", b: "mood", labelA: "Sleep hours", labelB: "Mood", colorA: "var(--sky)", colorB: "var(--periwinkle)", copy: (r: number) => (r > 0 ? "Nights with more sleep line up with higher mood scores the next day." : "More sleep hasn't lined up with higher mood in this window.") },
  { a: "steps", b: "sleep", labelA: "Steps", labelB: "Sleep hours", colorA: "var(--salmon)", colorB: "var(--sky)", copy: (r: number) => (r > 0 ? "More movement during the day tends to precede longer sleep." : "Movement and sleep length aren't moving together right now.") },
  { a: "steps", b: "stress", labelA: "Steps", labelB: "Stress", colorA: "var(--salmon)", colorB: "var(--salmon)", copy: (r: number) => (r < 0 ? "Higher step days come with lower reported stress." : "Step count and stress aren't clearly related in this window.") },
  { a: "calories", b: "sleep", labelA: "Calories eaten", labelB: "Sleep hours", colorA: "var(--butter)", colorB: "var(--sky)", copy: () => "Eating patterns and sleep length compared across the selected period." },
  { a: "habits", b: "mood", labelA: "Habit completion", labelB: "Mood", colorA: "var(--mint)", colorB: "var(--periwinkle)", copy: (r: number) => (r > 0 ? "Days where you completed more habits scored higher on mood." : "Habit completion isn't tracking with mood right now.") },
  { a: "activeMinutes", b: "energy", labelA: "Active minutes", labelB: "Energy", colorA: "var(--mint)", colorB: "var(--butter)", copy: (r: number) => (r > 0 ? "More active minutes coincide with higher self-reported energy." : "Active minutes and energy aren't tracking together.") },
];

const RANGES: Array<{ v: Range; label: string }> = [
  { v: 7, label: "7 days" },
  { v: 30, label: "30 days" },
  { v: 90, label: "3 months" },
];

function ConnectionsPage() {
  const store = useHealthStore();
  const [range, setRange] = useState<Range>(30);
  const series = trendSeries(range, store);

  const results = PAIRS.map((p) => {
    const xs = series.map((d) => Number(d[p.a as keyof typeof d] ?? 0));
    const ys = series.map((d) => Number(d[p.b as keyof typeof d] ?? 0));
    return { ...p, r: correlation(xs, ys) };
  }).sort((x, y) => Math.abs(y.r) - Math.abs(x.r));

  const top = results[0];

  return (
    <AppShell
      title="Health Connections"
      eyebrow="Cross-domain analysis"
      action={
        <div className="flex gap-1 rounded-full border border-border bg-raised p-1">
          {RANGES.map((r) => (
            <button
              key={r.v}
              onClick={() => setRange(r.v)}
              className="font-display rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.08em]"
              style={range === r.v ? { background: "var(--foreground)", color: "var(--background)" } : { color: "var(--muted-foreground)" }}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {top ? (
        <section
          className="mb-4 rounded-3xl border p-6"
          style={{ background: "linear-gradient(135deg,#26313A,#191919 60%)", borderColor: "#2E3D48" }}
        >
          <Pill color="var(--sky)">Strongest connection</Pill>
          <h2 className="font-display mt-3 text-xl font-bold uppercase tracking-[0.02em]">
            {top.labelA} ↔ {top.labelB}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {top.copy(top.r)} Correlation r = {top.r.toFixed(2)} ({correlationStrength(top.r).toLowerCase()}) across the
            last {range} days.
          </p>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {results.map((p) => (
          <Panel
            key={`${p.a}-${p.b}`}
            title={`${p.labelA} vs ${p.labelB}`}
            accent={p.colorA}
            action={
              <Pill color={Math.abs(p.r) >= 0.35 ? "var(--mint)" : "var(--muted-foreground)"}>
                r {p.r.toFixed(2)} · {correlationStrength(p.r)}
              </Pill>
            }
          >
            <TrendLine
              data={series}
              series={[
                { key: p.a, name: p.labelA, color: p.colorA },
                { key: p.b, name: p.labelB, color: p.colorB },
              ]}
            />
            <p className="mt-3 text-sm text-muted-foreground">{p.copy(p.r)}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <Disclaimer />
        <p className="mt-2 text-xs text-muted-foreground">
          Correlation describes how two of your metrics moved together — it does not prove that one caused the other.
        </p>
      </div>
    </AppShell>
  );
}
