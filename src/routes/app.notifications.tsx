import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, Panel, Pill } from "@/components/health/primitives";
import { Button } from "@/components/ui/button";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — WellSync" },
      { name: "description", content: "Goal completions, habit reminders, new insights and sync updates." },
      { property: "og:title", content: "Notifications — WellSync" },
      { property: "og:description", content: "Everything your account wants to tell you." },
    ],
  }),
  component: NotificationsPage,
});

const TONE: Record<string, string> = {
  goal: "var(--mint)",
  habit: "var(--butter)",
  report: "var(--sky)",
  insight: "var(--periwinkle)",
  sync: "var(--salmon)",
};

function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead } = useHealthStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell
      title="Notifications"
      eyebrow={`${unread} unread`}
      action={
        <Button size="sm" variant="outline" className="rounded-full" onClick={markAllRead}>
          <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
        </Button>
      }
    >
      {notifications.length === 0 ? (
        <EmptyState title="Nothing here" hint="New alerts about goals, habits and insights will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Panel key={n.id} accent={TONE[n.kind] ?? "var(--mint)"}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <span className="mt-0.5 shrink-0" style={{ color: TONE[n.kind] }}>
                  <Bell className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-sm font-semibold">{n.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Pill color={TONE[n.kind] ?? "var(--mint)"}>{n.kind}</Pill>
                    <span className="font-mono text-[10px] text-muted-foreground">{n.time}</span>
                  </div>
                </div>
                {!n.read ? (
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={() => markNotificationRead(n.id)}>
                    Mark read
                  </Button>
                ) : null}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}
