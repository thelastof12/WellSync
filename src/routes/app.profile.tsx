import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Pill } from "@/components/health/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — WellSync" },
      { name: "description", content: "Manage your health profile: body metrics, goals, targets and wellness preferences." },
      { property: "og:title", content: "Profile — WellSync" },
      { property: "og:description", content: "Your personal health baseline and targets." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, updateUser, updateProfile } = useHealthStore();
  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    age: String(profile.age),
    gender: profile.gender,
    heightCm: String(profile.heightCm),
    weightKg: String(profile.weightKg),
    primaryGoal: profile.primaryGoal,
    activityPreference: profile.activityPreference,
    sleepTargetHours: String(profile.sleepTargetHours),
    calorieTarget: String(profile.calorieTarget),
    stepTarget: String(profile.stepTarget),
  });

  const bmi = +(Number(form.weightKg) / Math.pow(Number(form.heightCm) / 100, 2)).toFixed(1);

  const save = () => {
    if (!form.fullName.trim() || !form.email.includes("@")) {
      toast.error("Enter a valid name and email address.");
      return;
    }
    updateUser({ fullName: form.fullName.trim().slice(0, 80), email: form.email.trim() });
    updateProfile({
      age: Number(form.age),
      gender: form.gender,
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      primaryGoal: form.primaryGoal,
      activityPreference: form.activityPreference,
      sleepTargetHours: Number(form.sleepTargetHours),
      calorieTarget: Number(form.calorieTarget),
      stepTarget: Number(form.stepTarget),
    });
    toast.success("Profile updated.");
  };

  return (
    <AppShell title="Profile" eyebrow="Account">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Personal details" accent="var(--mint)">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { k: "fullName", label: "Full name", type: "text" },
              { k: "email", label: "Email", type: "email" },
              { k: "age", label: "Age", type: "number" },
              { k: "gender", label: "Gender", type: "text" },
              { k: "heightCm", label: "Height (cm)", type: "number" },
              { k: "weightKg", label: "Weight (kg)", type: "number" },
              { k: "primaryGoal", label: "Primary goal", type: "text" },
              { k: "activityPreference", label: "Activity preference", type: "text" },
              { k: "sleepTargetHours", label: "Sleep target (h)", type: "number" },
              { k: "calorieTarget", label: "Calorie target", type: "number" },
              { k: "stepTarget", label: "Daily step target", type: "number" },
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
          </div>
          <Button className="mt-5 rounded-full" onClick={save}>
            Save changes
          </Button>
        </Panel>

        <div className="space-y-4">
          <Panel title="Body snapshot" accent="var(--sky)">
            <div className="font-display text-4xl font-bold">{bmi || "—"}</div>
            <div className="font-mono mt-1 text-[11px] text-muted-foreground">Body mass index</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill color="var(--sky)">{form.heightCm} cm</Pill>
              <Pill color="var(--salmon)">{form.weightKg} kg</Pill>
              <Pill color="var(--butter)">{form.age} years</Pill>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              BMI is a rough screening figure only and doesn't account for muscle mass or body composition.
            </p>
          </Panel>

          <Panel title="Wellness preferences" accent="var(--periwinkle)">
            <div className="flex flex-wrap gap-2">
              {profile.wellnessPreferences.map((p) => (
                <Pill key={p} color="var(--periwinkle)">
                  {p}
                </Pill>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
