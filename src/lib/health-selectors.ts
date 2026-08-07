import {
  lastNDays,
  type ActivityLog,
  type Goal,
  type Habit,
  type MealLog,
  type MoodLog,
  type SleepLog,
} from "./health-data";

/** Derived read models. Pure functions so they can be reused by an API later. */

export type Range = 7 | 30 | 90;

export const rangeDays = (range: Range) => lastNDays(range);

export function byDate<T extends { date: string }>(rows: T[]) {
  const map = new Map<string, T[]>();
  rows.forEach((r) => {
    const list = map.get(r.date);
    if (list) list.push(r);
    else map.set(r.date, [r]);
  });
  return map;
}

export const sum = (nums: number[]) => nums.reduce((a, b) => a + b, 0);
export const avg = (nums: number[]) => (nums.length ? sum(nums) / nums.length : 0);

export function dayActivity(activity: ActivityLog[], date: string) {
  const rows = activity.filter((a) => a.date === date);
  return {
    steps: sum(rows.map((r) => r.steps)),
    distanceKm: +sum(rows.map((r) => r.distanceKm)).toFixed(2),
    calories: sum(rows.map((r) => r.calories)),
    activeMinutes: sum(rows.map((r) => r.durationMin)),
    sessions: rows.length,
    rows,
  };
}

export function dayNutrition(meals: MealLog[], date: string) {
  const rows = meals.filter((m) => m.date === date);
  return {
    calories: sum(rows.map((r) => r.calories)),
    protein: sum(rows.map((r) => r.protein)),
    carbs: sum(rows.map((r) => r.carbs)),
    fat: sum(rows.map((r) => r.fat)),
    rows,
  };
}

export const dayMood = (mood: MoodLog[], date: string) => mood.find((m) => m.date === date);
export const daySleep = (sleep: SleepLog[], date: string) => sleep.find((s) => s.date === date);

export function habitsCompleted(habits: Habit[], date: string) {
  return habits.filter((h) => h.history[date]).length;
}

export function trendSeries(
  range: Range,
  data: {
    activity: ActivityLog[];
    meals: MealLog[];
    mood: MoodLog[];
    sleep: SleepLog[];
    habits: Habit[];
  },
) {
  return rangeDays(range).map((date) => {
    const a = dayActivity(data.activity, date);
    const n = dayNutrition(data.meals, date);
    const m = dayMood(data.mood, date);
    const s = daySleep(data.sleep, date);
    return {
      date,
      steps: a.steps,
      burned: a.calories,
      activeMinutes: a.activeMinutes,
      calories: n.calories,
      protein: n.protein,
      carbs: n.carbs,
      fat: n.fat,
      mood: m?.mood ?? 0,
      stress: m?.stress ?? 0,
      energy: m?.energy ?? 0,
      sleep: s?.hours ?? 0,
      habits: data.habits.length
        ? Math.round((habitsCompleted(data.habits, date) / data.habits.length) * 100)
        : 0,
    };
  });
}

/** Pearson correlation, used by the Health Connections module. */
export function correlation(xs: number[], ys: number[]) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = avg(xs.slice(0, n));
  const my = avg(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const a = (xs[i] ?? 0) - mx;
    const b = (ys[i] ?? 0) - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (!dx || !dy) return 0;
  return +(num / Math.sqrt(dx * dy)).toFixed(2);
}

export function correlationStrength(r: number) {
  const a = Math.abs(r);
  if (a >= 0.6) return "Strong pattern";
  if (a >= 0.35) return "Moderate pattern";
  if (a >= 0.15) return "Weak pattern";
  return "No clear pattern";
}

export function goalProgress(goal: Goal) {
  const inverse = goal.title.toLowerCase().includes("under");
  const pct = inverse
    ? Math.min(100, Math.round(((goal.target - goal.current) / goal.target) * 100 + 50))
    : Math.min(100, Math.round((goal.current / goal.target) * 100));
  const status =
    pct >= 100 ? "Completed" : pct >= 85 ? "Almost there" : pct >= 45 ? "On track" : "Needs focus";
  return { pct, status };
}

export function healthScore(input: {
  steps: number;
  stepTarget: number;
  sleepHours: number;
  sleepTarget: number;
  mood: number;
  habitPct: number;
  calories: number;
  calorieTarget: number;
}) {
  const s = Math.min(1, input.steps / input.stepTarget);
  const sl = Math.min(1, input.sleepHours / input.sleepTarget);
  const mo = input.mood / 10;
  const hb = input.habitPct / 100;
  const nu = 1 - Math.min(1, Math.abs(input.calories - input.calorieTarget) / input.calorieTarget);
  return Math.round((s * 0.25 + sl * 0.25 + mo * 0.2 + hb * 0.15 + nu * 0.15) * 100);
}
