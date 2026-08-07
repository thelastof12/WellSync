import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Panel, Pill } from "@/components/health/primitives";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/app/integrations")({
  head: () => ({
    meta: [
      { title: "Integrations — WellSync" },
      { name: "description", content: "Connect wearables and health platforms to sync your activity and sleep data." },
      { property: "og:title", content: "Integrations — WellSync" },
      { property: "og:description", content: "Apple Health, Google Fit, Fitbit and Garmin connections." },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const { integrations, toggleIntegration } = useHealthStore();

  return (
    <AppShell title="Integrations" eyebrow="Device sync">
      <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
        Connect a device to import steps, workouts, heart rate and sleep automatically. You can disconnect at any
        time — your existing entries stay in your account.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {integrations.map((i) => (
          <Panel key={i.id} accent={i.connected ? "var(--mint)" : "var(--muted-foreground)"}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-raised text-xl">{i.icon}</div>
                <div className="min-w-0">
                  <div className="font-display truncate text-base font-semibold">{i.name}</div>
                  <div className="font-mono mt-0.5 text-[11px] text-muted-foreground">
                    {i.connected ? `Last sync ${i.lastSync}` : "Not connected"}
                  </div>
                </div>
              </div>
              <Switch
                checked={i.connected}
                onCheckedChange={() => {
                  toggleIntegration(i.id);
                  toast.success(`${i.name} ${i.connected ? "disconnected" : "connected"}.`);
                }}
                aria-label={`Toggle ${i.name}`}
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Pill color={i.connected ? "var(--mint)" : "var(--muted-foreground)"}>
                {i.connected ? "Syncing" : "Idle"}
              </Pill>
              <Button
                size="sm"
                variant="ghost"
                disabled={!i.connected}
                onClick={() => toast.success(`${i.name} synced.`)}
              >
                <RefreshCw className="mr-1 h-4 w-4" /> Sync now
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
