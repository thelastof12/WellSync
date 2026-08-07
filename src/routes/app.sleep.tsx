import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Metric, Panel, Pill } from "@/components/health/primitives";
import { TrendArea, TrendBars } from "@/components/health/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useHealthStore } from "@/lib/health-store";
import { avg, daySleep, trendSeries } from "@/lib/health-selectors";
import type { SleepLog } from "@/lib/health-data";

export const Route = createFileRoute("/app/sleep")({
  head: () => ({
    meta: [
      { title: "Sleep — WellSync" },
      { name: "description", content: "Track sleep duration, quality, bedtime consistency and rest trends." },
      { property: "og:title", content: "Sleep — WellSync" },
      { property: "og:description", content: "Understand how your rest shapes the rest of your day." },
    ],
  }),
  component: SleepPage,
});

const QUALITIES: SleepLog["quality"][] = ["Poor", "Fair", "Good", "Excellent"];

function SleepPage() {
  const store = useHealthStore();
  const { today, profile } = store;
  const night = daySleep(store.sleep, today);
  const week = trendSeries(7, store);
  const month = trendSeries(30, store);
  const weekAvg = avg(week.map((d) => d.sleep));
  const monthAvg = avg(month.map((d) => d.sleep));
  const debt = Math.max(0, profile.sleepTargetHours * 7 - week.reduce((a, d) => a + d.sleep, 0));

  return (
    <AppShell title="Sleep" eyebrow="Rest module" action={<LogSleepDialog />}>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Last night"
          accent="var(--sky)"
          value={night ? `${Math.floor(night.hours)}h ${Math.round((night.hours % 1) * 60)}m` : "—"}
          progress={((night?.hours ?? 0) / profile.sleepTargetHours) * 100}
          foot={`Target ${profile.sleepTargetHours}h · ${night?.bedtime ?? "—"} → ${night?.wakeTime ?? "—"}`}
        />
        <Metric label="7-day average" accent="var(--periwinkle)" value={weekAvg.toFixed(1)} unit="h" foot="Rolling week" />
        <Metric label="30-day average" accent="var(--mint)" value={monthAvg.toFixed(1)} unit="h" foot="Rolling month" />
        <Metric label="Sleep debt" accent="var(--salmon)" value={debt.toFixed(1)} unit="h" foot="Versus weekly target" />
      </div>

      <Panel title="Sleep duration — last 30 days" accent="var(--sky)" className="mb-4">
        <TrendArea data={month} series={[{ key: "sleep", name: "Hours slept", color: "var(--sky)" }]} height={280} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="This week" accent="var(--sky)">
          <TrendBars data={week} series={[{ key: "sleep", name: "Hours", color: "var(--sky)" }]} />
        </Panel>
        <Panel
          title="Sleep quality breakdown"
          accent="var(--periwinkle)"
          action={<Pill color="var(--periwinkle)">Last 30 nights</Pill>}
        >
          <ul className="space-y-3">
            {QUALITIES.map((q) => {
              const rows = store.sleep.slice(-30).filter((s) => s.quality === q);
              const pct = Math.round((rows.length / 30) * 100);
              return (
                <li key={q}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span>{q}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {rows.length} nights · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-raised">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--periwinkle)" }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            {weekAvg >= profile.sleepTargetHours
              ? "You're meeting your sleep target on average — consistency is doing the heavy lifting."
              : `You're averaging ${(profile.sleepTargetHours - weekAvg).toFixed(1)}h below target. An earlier bedtime is usually the easiest lever.`}
          </p>
        </Panel>
      </div>
    </AppShell>
  );
}

function LogSleepDialog() {
  const { addSleep, today } = useHealthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: today,
    hours: "7.5",
    bedtime: "23:00",
    wakeTime: "06:30",
    quality: "Good" as SleepLog["quality"],
  });

  const save = () => {
    const hours = Number(form.hours);
    if (!(hours > 0 && hours <= 24)) {
      toast.error("Enter a sleep duration between 0 and 24 hours.");
      return;
    }
    addSleep({ date: form.date, hours, bedtime: form.bedtime, wakeTime: form.wakeTime, quality: form.quality });
    setOpen(false);
    toast.success("Sleep entry saved.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Log Sleep
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log last night's sleep</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Hours slept</Label>
            <Input type="number" step="0.1" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Bedtime</Label>
            <Input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Wake time</Label>
            <Input type="time" value={form.wakeTime} onChange={(e) => setForm({ ...form, wakeTime: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Quality</Label>
            <select
              className="h-10 w-full rounded-xl border border-border bg-raised px-3 text-sm"
              value={form.quality}
              onChange={(e) => setForm({ ...form, quality: e.target.value as SleepLog["quality"] })}
            >
              {QUALITIES.map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={save}>
            Save sleep
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
