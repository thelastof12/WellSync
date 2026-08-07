import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Metric, Panel, Pill } from "@/components/health/primitives";
import { TrendLine } from "@/components/health/charts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useHealthStore } from "@/lib/health-store";
import { avg, dayMood, trendSeries } from "@/lib/health-selectors";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/mind")({
  head: () => ({
    meta: [
      { title: "Mental Well-being — WellSync" },
      { name: "description", content: "Record mood, stress and private journal entries, and follow your emotional trends." },
      { property: "og:title", content: "Mental Well-being — WellSync" },
      { property: "og:description", content: "A calm space for mood, stress and reflection." },
    ],
  }),
  component: MindPage,
});

const MOODS = [
  { emoji: "😞", label: "Very poor", score: 2 },
  { emoji: "🙁", label: "Poor", score: 4 },
  { emoji: "😐", label: "Okay", score: 6 },
  { emoji: "🙂", label: "Good", score: 8 },
  { emoji: "😄", label: "Excellent", score: 10 },
];

function MindPage() {
  const store = useHealthStore();
  const { today, addMood } = store;
  const entry = dayMood(store.mood, today);
  const [moodScore, setMoodScore] = useState(entry?.mood ?? 8);
  const [stress, setStress] = useState(entry?.stress ?? 4);
  const [energy, setEnergy] = useState(entry?.energy ?? 7);
  const [journal, setJournal] = useState(entry?.journal ?? "");

  const week = trendSeries(7, store);
  const weekMood = avg(week.map((d) => d.mood));
  const weekStress = avg(week.map((d) => d.stress));

  const save = () => {
    addMood({ date: today, mood: moodScore, stress, energy, journal: journal.slice(0, 1000) });
    toast.success("Check-in saved. Thanks for taking a moment.");
  };

  return (
    <AppShell title="Mental Well-being" eyebrow="Mind module">
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <Metric label="Mood today" accent="var(--periwinkle)" value={moodScore.toFixed(1)} unit="/10" progress={moodScore * 10} foot={`7-day average ${weekMood.toFixed(1)}`} />
        <Metric label="Stress today" accent="var(--salmon)" value={stress.toFixed(1)} unit="/10" progress={stress * 10} foot={`7-day average ${weekStress.toFixed(1)}`} />
        <Metric label="Energy" accent="var(--mint)" value={energy.toFixed(1)} unit="/10" progress={energy * 10} foot="Self-reported" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Panel title="Daily check-in" accent="var(--periwinkle)">
          <Label>How are you feeling today?</Label>
          <div className="mt-3 flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.label}
                onClick={() => setMoodScore(m.score)}
                className={cn(
                  "flex-1 rounded-2xl border bg-raised py-3 text-2xl transition-colors",
                  moodScore === m.score ? "border-[color:var(--butter)]" : "border-transparent",
                )}
                title={m.label}
                aria-label={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <Label>Stress level — {stress.toFixed(0)}/10</Label>
            <Slider className="mt-3" min={1} max={10} step={1} value={[stress]} onValueChange={([v]) => setStress(v ?? stress)} />
          </div>
          <div className="mt-5">
            <Label>Energy level — {energy.toFixed(0)}/10</Label>
            <Slider className="mt-3" min={1} max={10} step={1} value={[energy]} onValueChange={([v]) => setEnergy(v ?? energy)} />
          </div>

          <div className="mt-6">
            <Label>Private journal</Label>
            <Textarea
              className="mt-2"
              rows={4}
              maxLength={1000}
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="Anything you'd like to remember about today…"
            />
            <div className="font-mono mt-1 text-[10px] text-muted-foreground">
              {journal.length}/1000 · visible only to you
            </div>
          </div>

          <Button className="mt-5 w-full rounded-full" size="lg" onClick={save}>
            Save check-in
          </Button>
        </Panel>

        <div className="space-y-4">
          <Panel title="Mood & stress — last 30 days" accent="var(--periwinkle)">
            <TrendLine
              data={trendSeries(30, store)}
              series={[
                { key: "mood", name: "Mood", color: "var(--periwinkle)" },
                { key: "stress", name: "Stress", color: "var(--salmon)" },
              ]}
            />
          </Panel>
          <Panel title="Gentle feedback" accent="var(--mint)">
            <div className="flex flex-wrap gap-2">
              <Pill color="var(--mint)">Non-clinical</Pill>
              <Pill color="var(--sky)">Based on your own entries</Pill>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {weekMood >= 7
                ? "Your mood has held steady above 7 this week — whatever routine you're keeping seems to suit you."
                : "Your mood has dipped a little this week. Short walks and an earlier bedtime have lifted it for you before."}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              These reflections describe patterns in the data you logged. They are not a diagnosis.
              If you're struggling, please speak with a qualified health professional.
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
