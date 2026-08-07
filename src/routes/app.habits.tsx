import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, Metric, Panel } from "@/components/health/primitives";
import { TrendBars } from "@/components/health/charts";
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
import { habitsCompleted, trendSeries } from "@/lib/health-selectors";
import { lastNDays, shortDay, type Habit } from "@/lib/health-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/habits")({
  head: () => ({
    meta: [
      { title: "Habits — WellSync" },
      { name: "description", content: "Build daily habits, keep streaks alive and see your consistency calendar." },
      { property: "og:title", content: "Habits — WellSync" },
      { property: "og:description", content: "Streaks, check-ins and consistency at a glance." },
    ],
  }),
  component: HabitsPage,
});

function HabitsPage() {
  const store = useHealthStore();
  const { habits, today, toggleHabit, removeHabit } = store;
  const done = habitsCompleted(habits, today);
  const days = lastNDays(21);
  const best = Math.max(0, ...habits.map((h) => h.streak));
  const week = trendSeries(7, store);

  return (
    <AppShell title="Habits" eyebrow="Consistency module" action={<AddHabitDialog />}>
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Metric
          label="Today"
          accent="var(--mint)"
          value={`${done}/${habits.length}`}
          progress={habits.length ? (done / habits.length) * 100 : 0}
          foot="Habits completed"
        />
        <Metric label="Longest streak" accent="var(--butter)" value={best} unit="days" foot="Across all habits" />
        <Metric
          label="Weekly consistency"
          accent="var(--periwinkle)"
          value={`${Math.round(week.reduce((a, d) => a + d.habits, 0) / 7)}%`}
          progress={week.reduce((a, d) => a + d.habits, 0) / 7}
          foot="7-day average completion"
        />
      </div>

      <Panel title="Completion — last 7 days" accent="var(--mint)" className="mb-4">
        <TrendBars data={week} series={[{ key: "habits", name: "Completion %", color: "var(--mint)" }]} />
      </Panel>

      {habits.length === 0 ? (
        <EmptyState title="No habits yet" hint="Add your first habit to start a streak." action={<AddHabitDialog />} />
      ) : (
        <div className="space-y-4">
          {habits.map((h) => (
            <HabitRow key={h.id} habit={h} days={days} today={today} onToggle={toggleHabit} onRemove={removeHabit} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function HabitRow({
  habit,
  days,
  today,
  onToggle,
  onRemove,
}: {
  habit: Habit;
  days: string[];
  today: string;
  onToggle: (id: string, date: string) => void;
  onRemove: (id: string) => void;
}) {
  const doneToday = !!habit.history[today];
  return (
    <Panel accent={habit.color}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
        <div className="min-w-0">
          <div className="font-display truncate text-base font-semibold">{habit.name}</div>
          <div className="font-mono mt-1 text-[11px] text-muted-foreground">
            {habit.frequency} · {habit.target}
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-sm" style={{ color: habit.color }}>
            <Flame className="h-4 w-4" /> {habit.streak}-day streak
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant={doneToday ? "default" : "outline"}
            className="rounded-full"
            onClick={() => onToggle(habit.id, today)}
          >
            <Check className="mr-1 h-4 w-4" /> {doneToday ? "Done" : "Mark done"}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${habit.name}`}
            onClick={() => {
              onRemove(habit.id);
              toast.success("Habit removed.");
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {days.map((d) => {
          const on = !!habit.history[d];
          return (
            <button
              key={d}
              onClick={() => onToggle(habit.id, d)}
              title={`${shortDay(d)} — ${on ? "completed" : "missed"}`}
              className={cn("h-7 w-7 rounded-lg border text-[9px] transition-colors")}
              style={{
                background: on ? habit.color : "var(--raised)",
                borderColor: on ? habit.color : "var(--border)",
                color: on ? "var(--background)" : "var(--muted-foreground)",
              }}
            >
              {new Date(d + "T00:00:00").getDate()}
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function AddHabitDialog() {
  const { addHabit } = useHealthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target: "10 min", frequency: "Daily" as Habit["frequency"] });
  const colors = ["var(--mint)", "var(--sky)", "var(--salmon)", "var(--butter)", "var(--periwinkle)"];

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Give the habit a name.");
      return;
    }
    addHabit({
      name: form.name.trim().slice(0, 60),
      target: form.target,
      frequency: form.frequency,
      color: colors[Math.floor(Math.random() * colors.length)] ?? "var(--mint)",
    });
    setForm({ ...form, name: "" });
    setOpen(false);
    toast.success("Habit created.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> New Habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Habit name</Label>
            <Input maxLength={60} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Stretch after work" />
          </div>
          <div className="space-y-1.5">
            <Label>Target</Label>
            <Input value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Frequency</Label>
            <select
              className="h-10 w-full rounded-xl border border-border bg-raised px-3 text-sm"
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value as Habit["frequency"] })}
            >
              <option>Daily</option>
              <option>Weekdays</option>
              <option>3x / week</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={save}>
            Create habit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
