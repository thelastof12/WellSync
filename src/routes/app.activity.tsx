import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Metric, Panel, Pill } from "@/components/health/primitives";
import { TrendBars, TrendLine } from "@/components/health/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useHealthStore } from "@/lib/health-store";
import { dayActivity, trendSeries } from "@/lib/health-selectors";
import { prettyDate } from "@/lib/health-data";

export const Route = createFileRoute("/app/activity")({
  head: () => ({
    meta: [
      { title: "Physical Activity — WellSync" },
      { name: "description", content: "Track steps, workouts, distance, active minutes and calories burned." },
      { property: "og:title", content: "Physical Activity — WellSync" },
      { property: "og:description", content: "Your movement data, sessions and goal progress." },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const store = useHealthStore();
  const { today, profile } = store;
  const day = dayActivity(store.activity, today);
  const week = trendSeries(7, store);
  const recent = [...store.activity].reverse().slice(0, 8);

  return (
    <AppShell title="Physical Activity" eyebrow="Movement module" action={<LogActivityDialog />}>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Steps"
          accent="var(--salmon)"
          value={day.steps.toLocaleString()}
          progress={(day.steps / profile.stepTarget) * 100}
          foot={`${Math.round((day.steps / profile.stepTarget) * 100)}% of ${profile.stepTarget.toLocaleString()}`}
        />
        <Metric label="Distance" accent="var(--mint)" value={day.distanceKm} unit="km" foot="Today" />
        <Metric label="Calories burned" accent="var(--butter)" value={day.calories} unit="kcal" foot="Today" />
        <Metric
          label="Active minutes"
          accent="var(--sky)"
          value={day.activeMinutes}
          unit="min"
          foot={`${day.sessions} session${day.sessions === 1 ? "" : "s"} logged`}
        />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Daily steps — last 7 days" accent="var(--salmon)">
          <TrendBars data={week} series={[{ key: "steps", name: "Steps", color: "var(--salmon)" }]} />
        </Panel>
        <Panel title="Calories burned trend" accent="var(--butter)">
          <TrendLine
            data={trendSeries(30, store)}
            series={[{ key: "burned", name: "Calories burned", color: "var(--butter)" }]}
          />
        </Panel>
      </div>

      <Panel
        title="Workout sessions"
        accent="var(--mint)"
        action={<Pill color="var(--mint)">{store.activity.length} total records</Pill>}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Calories</TableHead>
                <TableHead>Steps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{prettyDate(r.date)}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.durationMin} min</TableCell>
                  <TableCell>{r.distanceKm} km</TableCell>
                  <TableCell>{r.calories} kcal</TableCell>
                  <TableCell>{r.steps.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </AppShell>
  );
}

function LogActivityDialog() {
  const { addActivity, today } = useHealthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "Running",
    durationMin: "30",
    distanceKm: "5",
    calories: "320",
    steps: "6000",
    date: today,
    notes: "",
  });

  const save = () => {
    if (!form.type.trim() || Number(form.durationMin) <= 0) {
      toast.error("Add an exercise type and a duration greater than zero.");
      return;
    }
    addActivity({
      date: form.date,
      type: form.type.trim(),
      durationMin: Number(form.durationMin),
      distanceKm: Number(form.distanceKm),
      calories: Number(form.calories),
      steps: Number(form.steps),
      notes: form.notes,
    });
    setOpen(false);
    toast.success("Activity successfully logged.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log an activity</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { k: "type", label: "Exercise type", type: "text" },
            { k: "date", label: "Date", type: "date" },
            { k: "durationMin", label: "Duration (min)", type: "number" },
            { k: "distanceKm", label: "Distance (km)", type: "number" },
            { k: "calories", label: "Calories burned", type: "number" },
            { k: "steps", label: "Steps", type: "number" },
          ].map((f) => (
            <div key={f.k} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input
                type={f.type}
                value={String(form[f.k as keyof typeof form])}
                onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
              />
            </div>
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="How did the session feel?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={save}>
            Save activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
