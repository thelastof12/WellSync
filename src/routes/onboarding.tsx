import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useHealthStore } from "@/lib/health-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Health profile setup — WellSync" },
      { name: "description", content: "Set up your health profile, goals and preferences." },
      { property: "og:title", content: "Health profile setup — WellSync" },
      { property: "og:description", content: "Personalise your WellSync health dashboard." },
    ],
  }),
  component: Onboarding,
});

const GOALS = ["Improve overall wellness", "Lose weight", "Build strength", "Sleep better", "Reduce stress"];
const ACTIVITIES = ["Walking", "Running & strength", "Cycling", "Yoga & mobility", "Team sports"];
const PREFS = ["Mindfulness", "Hydration", "Consistent bedtime", "Journaling", "Screen-time limits"];

function Onboarding() {
  const { profile, updateProfile } = useHealthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(profile);

  const steps = ["Basics", "Goals", "Targets", "Preferences"];

  const toggle = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const finish = () => {
    updateProfile(draft);
    toast.success("Health profile saved");
    navigate({ to: "/app" });
  };

  return (
    <AuthLayout
      title="Set up your health profile"
      subtitle="We only ask for what's needed to personalise your dashboard."
    >
      <div className="mb-6 flex gap-1.5">
        {steps.map((s, i) => (
          <div
            key={s}
            className="h-1.5 flex-1 rounded-full"
            style={{ background: i <= step ? "var(--mint)" : "var(--raised)" }}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <Input
                type="number"
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
              />
            </Field>
            <Field label="Gender">
              <select
                className="h-10 w-full rounded-xl border border-border bg-raised px-3 text-sm"
                value={draft.gender}
                onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
              >
                {["Male", "Female", "Prefer not to say"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Height (cm)">
              <Input
                type="number"
                value={draft.heightCm}
                onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })}
              />
            </Field>
            <Field label="Weight (kg)">
              <Input
                type="number"
                value={draft.weightKg}
                onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
              />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <ChipGroup
            label="Primary health goal"
            options={GOALS}
            selected={[draft.primaryGoal]}
            onSelect={(v) => setDraft({ ...draft, primaryGoal: v })}
          />
          <ChipGroup
            label="Activity preference"
            options={ACTIVITIES}
            selected={[draft.activityPreference]}
            onSelect={(v) => setDraft({ ...draft, activityPreference: v })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label>Daily step target — {draft.stepTarget.toLocaleString()}</Label>
            <Slider
              className="mt-3"
              min={3000}
              max={20000}
              step={500}
              value={[draft.stepTarget]}
              onValueChange={([v]) => setDraft({ ...draft, stepTarget: v ?? draft.stepTarget })}
            />
          </div>
          <div>
            <Label>Sleep target — {draft.sleepTargetHours} hours</Label>
            <Slider
              className="mt-3"
              min={5}
              max={10}
              step={0.5}
              value={[draft.sleepTargetHours]}
              onValueChange={([v]) => setDraft({ ...draft, sleepTargetHours: v ?? draft.sleepTargetHours })}
            />
          </div>
          <div>
            <Label>Daily calorie goal — {draft.calorieTarget} kcal</Label>
            <Slider
              className="mt-3"
              min={1200}
              max={3500}
              step={50}
              value={[draft.calorieTarget]}
              onValueChange={([v]) => setDraft({ ...draft, calorieTarget: v ?? draft.calorieTarget })}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <ChipGroup
          label="Wellness preferences"
          options={PREFS}
          selected={draft.wellnessPreferences}
          onSelect={(v) =>
            setDraft({ ...draft, wellnessPreferences: toggle(draft.wellnessPreferences, v) })
          }
        />
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="rounded-full" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button
          className="flex-1 rounded-full"
          onClick={() => (step === steps.length - 1 ? finish() : setStep(step + 1))}
        >
          {step === steps.length - 1 ? "Finish setup" : "Continue"}
        </Button>
      </div>
    </AuthLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ChipGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string[];
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onSelect(o)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                on
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-raised text-muted-foreground hover:text-foreground",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
