import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Disclaimer, Metric, Panel, Pill } from "@/components/health/primitives";
import { TrendArea } from "@/components/health/charts";
import { Button } from "@/components/ui/button";
import { useHealthStore } from "@/lib/health-store";
import { avg, trendSeries, type Range } from "@/lib/health-selectors";
import { prettyDate } from "@/lib/health-data";

export const Route = createFileRoute("/app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — WellSync" },
      { name: "description", content: "Weekly and monthly wellness summaries you can review or export." },
      { property: "og:title", content: "Reports — WellSync" },
      { property: "og:description", content: "Period summaries across every health domain." },
    ],
  }),
  component: ReportsPage,
});

const RANGES: Array<{ v: Range; label: string }> = [
  { v: 7, label: "Weekly" },
  { v: 30, label: "Monthly" },
  { v: 90, label: "Quarterly" },
];

function ReportsPage() {
  const store = useHealthStore();
  const [range, setRange] = useState<Range>(7);
  const series = trendSeries(range, store);
  const first = series[0];
  const last = series[series.length - 1];

  const exportCsv = () => {
    const header = Object.keys(series[0] ?? { date: "" }).join(",");
    const body = series.map((row) => Object.values(row).join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitality-report-${range}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported as CSV.");
  };

  return (
    <AppShell
      title="Reports"
      eyebrow="Summaries"
      action={
        <Button size="sm" className="rounded-full" onClick={exportCsv}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      }
    >
      <div className="mb-4 flex gap-1 rounded-full border border-border bg-raised p-1 sm:w-fit">
        {RANGES.map((r) => (
          <button
            key={r.v}
            onClick={() => setRange(r.v)}
            className="font-display flex-1 rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.08em] sm:flex-none"
            style={range === r.v ? { background: "var(--foreground)", color: "var(--background)" } : { color: "var(--muted-foreground)" }}
          >
            {r.label}
          </button>
        ))}
      </div>

      <Panel
        title="Period overview"
        accent="var(--mint)"
        className="mb-4"
        action={
          <Pill color="var(--mint)">
            {first ? prettyDate(first.date) : ""} → {last ? prettyDate(last.date) : ""}
          </Pill>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Avg steps" accent="var(--salmon)" value={Math.round(avg(series.map((d) => d.steps))).toLocaleString()} foot="per day" />
          <Metric label="Avg calories" accent="var(--butter)" value={Math.round(avg(series.map((d) => d.calories))).toLocaleString()} unit="kcal" foot="per day" />
          <Metric label="Avg sleep" accent="var(--sky)" value={avg(series.map((d) => d.sleep)).toFixed(1)} unit="h" foot="per night" />
          <Metric label="Avg mood" accent="var(--periwinkle)" value={avg(series.map((d) => d.mood)).toFixed(1)} unit="/10" foot="self-reported" />
          <Metric label="Habit rate" accent="var(--mint)" value={`${Math.round(avg(series.map((d) => d.habits)))}%`} foot="completion" />
        </div>
      </Panel>

      <Panel title="Steps and sleep over the period" accent="var(--sky)" className="mb-4">
        <TrendArea
          data={series}
          series={[
            { key: "steps", name: "Steps", color: "var(--salmon)" },
            { key: "sleep", name: "Sleep (h)", color: "var(--sky)" },
          ]}
          height={300}
        />
      </Panel>

      <Panel title="Written summary" accent="var(--butter)">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--butter)" }} />
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Over the last {range} days you logged an average of{" "}
              {Math.round(avg(series.map((d) => d.steps))).toLocaleString()} steps and{" "}
              {avg(series.map((d) => d.sleep)).toFixed(1)} hours of sleep per night, with mood averaging{" "}
              {avg(series.map((d) => d.mood)).toFixed(1)} out of 10.
            </p>
            <p>
              Habit completion sat at {Math.round(avg(series.map((d) => d.habits)))}%, and your nutrition averaged{" "}
              {Math.round(avg(series.map((d) => d.calories))).toLocaleString()} kcal against a target of{" "}
              {store.profile.calorieTarget.toLocaleString()} kcal.
            </p>
            <Disclaimer />
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
