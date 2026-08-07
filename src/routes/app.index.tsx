import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, Apple, Brain, CalendarCheck, Moon, Plus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Metric, Panel, Pill, Ring, Eyebrow } from "@/components/health/primitives";
import { TrendArea, TrendBars } from "@/components/health/charts";
import { Button } from "@/components/ui/button";
import { useHealthStore } from "@/lib/health-store";
import {
  dayActivity,
  dayMood,
  dayNutrition,
  daySleep,
  habitsCompleted,
  healthScore,
  trendSeries,
  type Range,
} from "@/lib/health-selectors";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WellSync" },
      { name: "description", content: "Your unified daily health overview across all five domains." },
      { property: "og:title", content: "Dashboard — WellSync" },
      { property: "og:description", content: "Activity, nutrition, mind, sleep and habits in one view." },
    ],
  }),
  component: Dashboard,
});

const RANGES: Array<{ v: Range; label: string }> = [
  { v: 7, label: "7 days" },
  { v: 30, label: "30 days" },
  { v: 90, label: "3 months" },
];

const METRICS = [
  { key: "steps", name: "Steps", color: "var(--salmon)" },
  { key: "calories", name: "Calories eaten", color: "var(--butter)" },
  { key: "sleep", name: "Sleep (h)", color: "var(--sky)" },
  { key: "mood", name: "Mood", color: "var(--periwinkle)" },
  { key: "stress", name: "Stress", color: "var(--salmon)" },
  { key: "habits", name: "Habit %", color: "var(--mint)" },
];

function Dashboard() {
  const store = useHealthStore();
  const { today, profile, user, habits } = store;
  const [range, setRange] = useState<Range>(7);
  const [metric, setMetric] = useState("steps");

  const act = dayActivity(store.activity, today);
  const nut = dayNutrition(store.meals, today);
  const mood = dayMood(store.mood, today);
  const sleep = daySleep(store.sleep, today);
  const doneHabits = habitsCompleted(habits, today);
  const series = trendSeries(range, store);

  const score = healthScore({
    steps: act.steps,
    stepTarget: profile.stepTarget,
    sleepHours: sleep?.hours ?? 0,
    sleepTarget: profile.sleepTargetHours,
    mood: mood?.mood ?? 0,
    habitPct: habits.length ? (doneHabits / habits.length) * 100 : 0,
    calories: nut.calories,
    calorieTarget: profile.calorieTarget,
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const active = METRICS.find((m) => m.key === metric) ?? METRICS[0]!;

  return (
    <AppShell
      title="Dashboard"
      eyebrow={new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      action={
        <Button asChild size="sm" className="rounded-full">
          <Link to="/app/activity">
            <Plus className="mr-1 h-4 w-4" /> Log
          </Link>
        </Button>
      }
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold uppercase tracking-[0.02em] sm:text-3xl">
          {greeting}, {user.fullName.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Here's your health overview for today.</p>
      </div>

      {/* Recovery / health score hero */}
      <section
        className="mb-4 rounded-3xl border p-6"
        style={{ background: "linear-gradient(160deg,#1D2620 0%, #171717 60%)", borderColor: "#253328" }}
      >
        <div className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <Ring value={score} size={110} label={`${score}%`} />
          <div className="min-w-0">
            <Eyebrow>Unified health score</Eyebrow>
            <div className="font-display mt-1 text-xl font-bold uppercase">
              {score >= 80 ? "Fully charged" : score >= 60 ? "Steady" : "Needs recovery"}
            </div>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              Calculated from today's movement, sleep, nutrition adherence, mood and habit
              completion — not from any single metric.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill color="var(--sky)">Sleep {sleep ? `${sleep.hours.toFixed(1)}h` : "—"}</Pill>
              <Pill color="var(--salmon)">{act.steps.toLocaleString()} steps</Pill>
              <Pill color="var(--periwinkle)">Mood {mood?.mood.toFixed(1) ?? "—"}/10</Pill>
              <Pill color="var(--mint)">
                {doneHabits}/{habits.length} habits
              </Pill>
            </div>
          </div>
        </div>
      </section>

      {/* Five domain cards */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Activity"
          accent="var(--salmon)"
          icon={<Activity className="h-4 w-4" />}
          value={act.steps.toLocaleString()}
          unit="steps"
          progress={(act.steps / profile.stepTarget) * 100}
          foot={`Target ${profile.stepTarget.toLocaleString()} · ${act.distanceKm} km · ${act.calories} kcal`}
        />
        <Metric
          label="Nutrition"
          accent="var(--butter)"
          icon={<Apple className="h-4 w-4" />}
          value={nut.calories.toLocaleString()}
          unit="kcal"
          progress={(nut.calories / profile.calorieTarget) * 100}
          foot={`Target ${profile.calorieTarget} kcal · P${nut.protein} C${nut.carbs} F${nut.fat}`}
        />
        <Metric
          label="Mental Well-being"
          accent="var(--periwinkle)"
          icon={<Brain className="h-4 w-4" />}
          value={(mood?.mood ?? 0) >= 7 ? "Good" : (mood?.mood ?? 0) >= 5 ? "Okay" : "Low"}
          progress={(mood?.mood ?? 0) * 10}
          foot={`Mood ${mood?.mood.toFixed(1) ?? "—"}/10 · Stress ${mood?.stress.toFixed(1) ?? "—"}/10`}
        />
        <Metric
          label="Sleep"
          accent="var(--sky)"
          icon={<Moon className="h-4 w-4" />}
          value={sleep ? `${Math.floor(sleep.hours)}h ${Math.round((sleep.hours % 1) * 60)}m` : "—"}
          progress={((sleep?.hours ?? 0) / profile.sleepTargetHours) * 100}
          foot={`Quality ${sleep?.quality ?? "—"} · Target ${profile.sleepTargetHours}h`}
        />
        <Metric
          label="Habits"
          accent="var(--mint)"
          icon={<CalendarCheck className="h-4 w-4" />}
          value={`${doneHabits}/${habits.length}`}
          unit="done"
          progress={habits.length ? (doneHabits / habits.length) * 100 : 0}
          foot={`Best streak ${Math.max(0, ...habits.map((h) => h.streak))} days`}
        />
      </div>

      {/* Trends */}
      <Panel
        className="mb-4"
        title="Health trends"
        action={
          <div className="flex gap-1 rounded-full border border-border bg-raised p-1">
            {RANGES.map((r) => (
              <button
                key={r.v}
                onClick={() => setRange(r.v)}
                className="font-display rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] transition-colors"
                style={
                  range === r.v
                    ? { background: "var(--foreground)", color: "var(--background)" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className="rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={
                metric === m.key
                  ? { background: m.color, borderColor: m.color, color: "var(--background)" }
                  : { borderColor: "var(--border)", color: "var(--muted-foreground)" }
              }
            >
              {m.name}
            </button>
          ))}
        </div>
        <TrendArea data={series} series={[active]} height={280} />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Weekly movement" accent="var(--salmon)" className="lg:col-span-2">
          <TrendBars
            data={trendSeries(7, store)}
            series={[
              { key: "steps", name: "Steps", color: "var(--salmon)" },
              { key: "activeMinutes", name: "Active min", color: "var(--mint)" },
            ]}
          />
        </Panel>

        <div
          className="rounded-3xl border p-5"
          style={{ background: "linear-gradient(120deg,#2A2440,#1B1B1D 55%)", borderColor: "#382F55" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: "var(--periwinkle)" }} />
            <Eyebrow>Today's AI insight</Eyebrow>
          </div>
          <p className="font-display mt-3 text-base font-semibold leading-snug">
            “Your average sleep rose from 6h 42m to 7h 18m this week, and your mood scores rose with
            it.”
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Wellness suggestion: keep your current bedtime routine for another week and re-check the
            correlation.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-5 rounded-full">
            <Link to="/app/insights">Open AI Insights</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
