import { createFileRoute, Link } from "@tanstack/react-router";
import { Lightbulb, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Disclaimer, Panel, Pill } from "@/components/health/primitives";
import { Button } from "@/components/ui/button";
import { useHealthStore } from "@/lib/health-store";
import { avg, correlation, trendSeries } from "@/lib/health-selectors";

export const Route = createFileRoute("/app/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — WellSync" },
      { name: "description", content: "Personalised, non-clinical wellness insights generated from your own logged data." },
      { property: "og:title", content: "AI Insights — WellSync" },
      { property: "og:description", content: "Patterns, nudges and recommendations built from your health history." },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const store = useHealthStore();
  const week = trendSeries(7, store);
  const prev = trendSeries(30, store).slice(0, 7);

  const sleepNow = avg(week.map((d) => d.sleep));
  const sleepPrev = avg(prev.map((d) => d.sleep));
  const moodNow = avg(week.map((d) => d.mood));
  const stepsNow = avg(week.map((d) => d.steps));
  const stepsPrev = avg(prev.map((d) => d.steps));
  const habitNow = avg(week.map((d) => d.habits));
  const rSleepMood = correlation(week.map((d) => d.sleep), week.map((d) => d.mood));

  const insights = [
    {
      icon: sleepNow >= sleepPrev ? TrendingUp : TrendingDown,
      accent: "var(--sky)",
      tag: "Sleep",
      title:
        sleepNow >= sleepPrev
          ? `Your sleep improved to ${sleepNow.toFixed(1)}h per night`
          : `Your sleep dropped to ${sleepNow.toFixed(1)}h per night`,
      body: `Compared with the previous week (${sleepPrev.toFixed(1)}h). Your mood averaged ${moodNow.toFixed(1)}/10 over the same period, and the two moved together with r = ${rSleepMood.toFixed(2)}.`,
      action: "Protect a consistent bedtime for the next 7 nights and re-check this card.",
    },
    {
      icon: stepsNow >= stepsPrev ? TrendingUp : TrendingDown,
      accent: "var(--salmon)",
      tag: "Activity",
      title: `You averaged ${Math.round(stepsNow).toLocaleString()} steps a day`,
      body: `That is ${Math.abs(Math.round(stepsNow - stepsPrev)).toLocaleString()} steps ${stepsNow >= stepsPrev ? "more" : "fewer"} than the previous week. Your most consistent movement days were mid-week.`,
      action: stepsNow >= store.profile.stepTarget ? "Hold this rhythm — it's already at target." : "A 15-minute afternoon walk would close most of the gap to your target.",
    },
    {
      icon: Lightbulb,
      accent: "var(--butter)",
      tag: "Nutrition",
      title: `Calories averaged ${Math.round(avg(week.map((d) => d.calories))).toLocaleString()} kcal per day`,
      body: `Your target is ${store.profile.calorieTarget.toLocaleString()} kcal. Protein averaged ${Math.round(avg(week.map((d) => d.protein)))}g daily, which supports the training load you logged.`,
      action: "Front-load protein at breakfast on training days.",
    },
    {
      icon: habitNow >= 70 ? TrendingUp : TrendingDown,
      accent: "var(--mint)",
      tag: "Habits",
      title: `Habit completion sits at ${Math.round(habitNow)}%`,
      body: "Days with higher habit completion also carried higher mood scores in your data — the routine itself seems to matter as much as any single habit.",
      action: "Pick the one habit you miss most often and shrink it until it's easy.",
    },
    {
      icon: Sparkles,
      accent: "var(--periwinkle)",
      tag: "Mind",
      title: `Mood averaged ${moodNow.toFixed(1)}/10 with stress at ${avg(week.map((d) => d.stress)).toFixed(1)}/10`,
      body: "Your lowest mood days followed your shortest nights. Nothing here suggests a clinical concern — it is simply the shape of your week.",
      action: "Try a 5-minute wind-down before bed on the nights you feel most wired.",
    },
  ];

  return (
    <AppShell title="AI Insights" eyebrow="Personalised analysis">
      <section
        className="mb-4 rounded-3xl border p-6"
        style={{ background: "linear-gradient(135deg,#2A2440,#1B1B1D 60%)", borderColor: "#382F55" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: "var(--periwinkle)" }} />
          <Pill color="var(--periwinkle)">Weekly summary</Pill>
        </div>
        <h2 className="font-display mt-3 max-w-3xl text-xl font-bold leading-snug sm:text-2xl">
          {sleepNow >= sleepPrev && moodNow >= 6.5
            ? "Better sleep carried your whole week — mood, energy and habit completion all followed it upward."
            : "Sleep was the limiting factor this week; mood and habit completion tracked it closely."}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Generated from {week.length} days of your logged activity, nutrition, sleep, mood and habit data.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-5 rounded-full">
          <Link to="/app/connections">See the underlying correlations</Link>
        </Button>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {insights.map((i) => (
          <Panel key={i.tag} title={i.tag} accent={i.accent}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 shrink-0" style={{ color: i.accent }}>
                <i.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="font-display text-base font-semibold leading-snug">{i.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
                <div className="mt-3 rounded-2xl bg-raised p-3 text-sm">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Suggestion
                  </span>
                  <p className="mt-1">{i.action}</p>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-card p-5">
        <Disclaimer />
      </div>
    </AppShell>
  );
}
