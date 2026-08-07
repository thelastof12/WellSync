import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, Panel, Pill, Ring } from "@/components/health/primitives";
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
import { goalProgress } from "@/lib/health-selectors";
import { DOMAIN_META, type Domain, type Goal } from "@/lib/health-data";

export const Route = createFileRoute("/app/goals")({
  head: () => ({
    meta: [
      { title: "Goals — WellSync" },
      { name: "description", content: "Set daily, weekly and monthly wellness goals and track progress toward each." },
      { property: "og:title", content: "Goals — WellSync" },
      { property: "og:description", content: "Your targets across activity, nutrition, mind, sleep and habits." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { goals, removeGoal } = useHealthStore();

  return (
    <AppShell title="Goals" eyebrow="Targets" action={<AddGoalDialog />}>
      {goals.length === 0 ? (
        <EmptyState title="No goals set" hint="Create a goal to give your daily logging a direction." action={<AddGoalDialog />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((g) => {
            const meta = DOMAIN_META[g.domain];
            const { pct, status } = goalProgress(g);
            return (
              <Panel key={g.id} title={meta.label} accent={meta.color}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                  <Ring value={pct} color={meta.color} size={88} />
                  <div className="min-w-0">
                    <div className="font-display truncate text-base font-semibold">{g.title}</div>
                    <div className="font-mono mt-1 text-[11px] text-muted-foreground">
                      {g.current.toLocaleString()} / {g.target.toLocaleString()} {g.unit}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Pill color={meta.color}>{status}</Pill>
                      <Pill color="var(--muted-foreground)">{g.period}</Pill>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted-foreground">Due {g.deadline}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${g.title}`}
                    onClick={() => {
                      removeGoal(g.id);
                      toast.success("Goal removed.");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function AddGoalDialog() {
  const { addGoal } = useHealthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    domain: "activity" as Domain,
    period: "Daily" as Goal["period"],
    target: "10000",
    current: "0",
    unit: "steps",
    deadline: "Today",
  });

  const save = () => {
    if (!form.title.trim() || Number(form.target) <= 0) {
      toast.error("Add a goal title and a target above zero.");
      return;
    }
    addGoal({
      title: form.title.trim().slice(0, 80),
      domain: form.domain,
      period: form.period,
      target: Number(form.target),
      current: Number(form.current),
      unit: form.unit,
      deadline: form.deadline,
    });
    setForm({ ...form, title: "" });
    setOpen(false);
    toast.success("Goal created.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> New Goal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a goal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Title</Label>
            <Input maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Walk 12,000 steps" />
          </div>
          <div className="space-y-1.5">
            <Label>Domain</Label>
            <select
              className="h-10 w-full rounded-xl border border-border bg-raised px-3 text-sm"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value as Domain })}
            >
              {(Object.keys(DOMAIN_META) as Domain[]).map((d) => (
                <option key={d} value={d}>
                  {DOMAIN_META[d].label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Period</Label>
            <select
              className="h-10 w-full rounded-xl border border-border bg-raised px-3 text-sm"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value as Goal["period"] })}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          {[
            { k: "target", label: "Target", type: "number" },
            { k: "current", label: "Current", type: "number" },
            { k: "unit", label: "Unit", type: "text" },
            { k: "deadline", label: "Deadline", type: "text" },
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
        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="rounded-full" onClick={save}>
            Create goal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
