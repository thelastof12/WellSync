import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Disclaimer, Panel } from "@/components/health/primitives";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WellSync" },
      { name: "description", content: "Control reminders, notifications, privacy and data export for your account." },
      { property: "og:title", content: "Settings — WellSync" },
      { property: "og:description", content: "Notification, privacy and data preferences." },
    ],
  }),
  component: SettingsPage,
});

const TOGGLES = [
  { k: "habitReminders", label: "Habit reminders", hint: "A nudge when a habit is still pending in the evening." },
  { k: "goalAlerts", label: "Goal alerts", hint: "Tell me when I complete or fall behind a goal." },
  { k: "weeklyReport", label: "Weekly report email", hint: "A summary of the week every Sunday evening." },
  { k: "insightAlerts", label: "New insight alerts", hint: "When a new cross-domain pattern is detected." },
  { k: "shareAnonymised", label: "Contribute anonymised data", hint: "Help improve population-level wellness research." },
];

function SettingsPage() {
  const { signOut } = useHealthStore();
  const navigate = useNavigate();
  const [state, setState] = useState<Record<string, boolean>>({
    habitReminders: true,
    goalAlerts: true,
    weeklyReport: true,
    insightAlerts: false,
    shareAnonymised: false,
  });

  return (
    <AppShell title="Settings" eyebrow="Preferences">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Notifications & privacy" accent="var(--mint)">
          <ul className="space-y-4">
            {TOGGLES.map((t) => (
              <li key={t.k} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <Label className="text-sm">{t.label}</Label>
                  <p className="mt-1 text-xs text-muted-foreground">{t.hint}</p>
                </div>
                <Switch
                  checked={!!state[t.k]}
                  onCheckedChange={(v) => {
                    setState((s) => ({ ...s, [t.k]: v }));
                    toast.success(`${t.label} ${v ? "enabled" : "disabled"}.`);
                  }}
                  aria-label={t.label}
                />
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Your data" accent="var(--sky)">
            <p className="text-sm text-muted-foreground">
              Your health entries belong to you. Export a copy at any time, or close the account to remove everything.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => toast.success("Export requested — you'll get an email shortly.")}>
                Export my data
              </Button>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  signOut();
                  toast.success("Signed out of all devices.");
                  navigate({ to: "/login" });
                }}
              >
                Sign out everywhere
              </Button>
            </div>
          </Panel>

          <Panel title="Help & support" accent="var(--butter)">
            <p className="text-sm text-muted-foreground">
              Questions about tracking, insights or your account? Reach the team at support@vitality.health and we'll
              reply within one working day.
            </p>
          </Panel>

          <Panel title="Medical notice" accent="var(--salmon)">
            <Disclaimer />
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
