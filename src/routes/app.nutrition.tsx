import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState, Metric, Panel } from "@/components/health/primitives";
import { Donut, TrendBars, TrendLine } from "@/components/health/charts";
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
import { dayNutrition, trendSeries } from "@/lib/health-selectors";
import type { MealLog } from "@/lib/health-data";

export const Route = createFileRoute("/app/nutrition")({
  head: () => ({
    meta: [
      { title: "Nutrition — WellSync" },
      { name: "description", content: "Log meals, calories, macronutrients and hydration with daily trends." },
      { property: "og:title", content: "Nutrition — WellSync" },
      { property: "og:description", content: "Your meals, macros and nutrition trends." },
    ],
  }),
  component: NutritionPage,
});

const MEAL_TYPES: MealLog["mealType"][] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function NutritionPage() {
  const store = useHealthStore();
  const { today, profile } = store;
  const day = dayNutrition(store.meals, today);
  const [water, setWater] = useState(6);

  const macros = [
    { name: "Protein", value: day.protein * 4, color: "var(--salmon)" },
    { name: "Carbs", value: day.carbs * 4, color: "var(--butter)" },
    { name: "Fat", value: day.fat * 9, color: "var(--sky)" },
  ];

  return (
    <AppShell title="Nutrition" eyebrow="Fuel module" action={<LogMealDialog />}>
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Calories"
          accent="var(--butter)"
          value={day.calories.toLocaleString()}
          unit="kcal"
          progress={(day.calories / profile.calorieTarget) * 100}
          foot={`Target ${profile.calorieTarget} kcal`}
        />
        <Metric label="Protein" accent="var(--salmon)" value={day.protein} unit="g" foot="Today" />
        <Metric label="Carbohydrates" accent="var(--butter)" value={day.carbs} unit="g" foot="Today" />
        <Metric label="Fat" accent="var(--sky)" value={day.fat} unit="g" foot="Today" />
        <Metric
          label="Water"
          accent="var(--sky)"
          value={water}
          unit="glasses"
          progress={(water / 8) * 100}
          foot={
            <button className="underline underline-offset-4" onClick={() => setWater((w) => Math.min(12, w + 1))}>
              + add a glass
            </button>
          }
        />
      </div>

      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Macronutrient split (kcal)" accent="var(--butter)">
          <Donut data={macros} />
        </Panel>
        <Panel title="Calories — last 30 days" accent="var(--butter)">
          <TrendLine
            data={trendSeries(30, store)}
            series={[{ key: "calories", name: "Calories", color: "var(--butter)" }]}
          />
        </Panel>
      </div>

      <Panel title="Weekly macros" accent="var(--salmon)" className="mb-4">
        <TrendBars
          stacked
          data={trendSeries(7, store)}
          series={[
            { key: "protein", name: "Protein (g)", color: "var(--salmon)" },
            { key: "carbs", name: "Carbs (g)", color: "var(--butter)" },
            { key: "fat", name: "Fat (g)", color: "var(--sky)" },
          ]}
        />
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MEAL_TYPES.map((type) => {
          const rows = day.rows.filter((r) => r.mealType === type);
          return (
            <Panel key={type} title={type} accent="var(--mint)">
              {rows.length === 0 ? (
                <EmptyState title="Nothing logged" hint={`No ${type.toLowerCase()} recorded today.`} />
              ) : (
                <ul className="space-y-3">
                  {rows.map((r) => (
                    <li key={r.id} className="rounded-2xl bg-raised p-3">
                      <div className="text-sm font-medium">{r.food}</div>
                      <div className="font-mono mt-1 text-[11px] text-muted-foreground">
                        {r.calories} kcal · P{r.protein} C{r.carbs} F{r.fat}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          );
        })}
      </div>
    </AppShell>
  );
}

function LogMealDialog() {
  const { addMeal, today } = useHealthStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    food: "",
    quantity: "1 serving",
    calories: "450",
    protein: "25",
    carbs: "50",
    fat: "14",
    mealType: "Lunch" as MealLog["mealType"],
    date: today,
  });

  const save = () => {
    if (!form.food.trim()) {
      toast.error("Enter the food name.");
      return;
    }
    addMeal({
      date: form.date,
      mealType: form.mealType,
      food: form.food.trim().slice(0, 100),
      quantity: form.quantity,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fat: Number(form.fat),
    });
    setOpen(false);
    setForm({ ...form, food: "" });
    toast.success("Meal successfully logged.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-full">
          <Plus className="mr-1 h-4 w-4" /> Log Meal
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a meal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Food name</Label>
            <Input
              value={form.food}
              maxLength={100}
              onChange={(e) => setForm({ ...form, food: e.target.value })}
              placeholder="Grilled chicken salad"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Meal type</Label>
            <select
              className="h-10 w-full rounded-xl border border-border bg-raised px-3 text-sm"
              value={form.mealType}
              onChange={(e) => setForm({ ...form, mealType: e.target.value as MealLog["mealType"] })}
            >
              {MEAL_TYPES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          {[
            { k: "quantity", label: "Quantity", type: "text" },
            { k: "calories", label: "Calories", type: "number" },
            { k: "protein", label: "Protein (g)", type: "number" },
            { k: "carbs", label: "Carbs (g)", type: "number" },
            { k: "fat", label: "Fat (g)", type: "number" },
            { k: "date", label: "Date", type: "date" },
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
            Save meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
