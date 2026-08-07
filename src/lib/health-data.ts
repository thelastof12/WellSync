/**
 * Domain types + realistic mock dataset.
 *
 * This module is the single seam between the UI and persistence. Every screen
 * reads through `HealthStore` (see health-store.tsx), so swapping this mock
 * source for a Node/Express + PostgreSQL REST client later requires no UI
 * changes — only replacing the loaders in `health-store.tsx`.
 */

export type ID = string;

export interface User {
  id: ID;
  fullName: string;
  email: string;
  role: "user" | "admin";
  joinedAt: string;
  status: "active" | "suspended";
  lastActive: string;
  records: number;
}

export interface HealthProfile {
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  primaryGoal: string;
  activityPreference: string;
  sleepTargetHours: number;
  calorieTarget: number;
  stepTarget: number;
  wellnessPreferences: string[];
}

export interface ActivityLog {
  id: ID;
  date: string;
  type: string;
  durationMin: number;
  distanceKm: number;
  calories: number;
  steps: number;
  notes?: string;
}

export interface MealLog {
  id: ID;
  date: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  food: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MoodLog {
  id: ID;
  date: string;
  mood: number; // 1-10
  stress: number; // 1-10
  energy: number; // 1-10
  journal?: string;
}

export interface SleepLog {
  id: ID;
  date: string;
  hours: number;
  quality: "Poor" | "Fair" | "Good" | "Excellent";
  bedtime: string;
  wakeTime: string;
}

export interface Habit {
  id: ID;
  name: string;
  frequency: "Daily" | "Weekdays" | "3x / week";
  target: string;
  color: string;
  streak: number;
  history: Record<string, boolean>; // date -> done
}

export interface Goal {
  id: ID;
  title: string;
  domain: Domain;
  period: "Daily" | "Weekly" | "Monthly";
  target: number;
  current: number;
  unit: string;
  deadline: string;
}

export interface Notification {
  id: ID;
  title: string;
  body: string;
  kind: "goal" | "habit" | "report" | "insight" | "sync";
  time: string;
  read: boolean;
}

export interface Integration {
  id: ID;
  name: string;
  icon: string;
  connected: boolean;
  lastSync: string | null;
}

export type Domain = "activity" | "nutrition" | "mind" | "sleep" | "habits";

export const DOMAIN_META: Record<
  Domain,
  { label: string; color: string; token: string }
> = {
  activity: { label: "Physical Activity", color: "var(--salmon)", token: "salmon" },
  nutrition: { label: "Nutrition", color: "var(--butter)", token: "butter" },
  mind: { label: "Mental Well-being", color: "var(--periwinkle)", token: "periwinkle" },
  sleep: { label: "Sleep", color: "var(--sky)", token: "sky" },
  habits: { label: "Habits", color: "var(--mint)", token: "mint" },
};

/* ---------- date helpers ---------- */

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export function lastNDays(n: number, from = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(isoDay(d));
  }
  return out;
}

export const shortDay = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

export const prettyDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

/* ---------- deterministic pseudo-random so charts stay stable ---------- */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const DAYS = lastNDays(90);
const rnd = seeded(4242);

/**
 * The whole demo dataset is generated from one correlated model so that
 * cross-domain insights (sleep↔mood, activity↔mood, nutrition↔energy) are
 * genuinely present in the data rather than decorative.
 */
function buildSeries() {
  const sleep: SleepLog[] = [];
  const mood: MoodLog[] = [];
  const activity: ActivityLog[] = [];
  const meals: MealLog[] = [];

  DAYS.forEach((date, i) => {
    const weekend = [0, 6].includes(new Date(date + "T00:00:00").getDay());
    const trend = i / DAYS.length; // slow improvement over the quarter
    const hours = +(6.1 + trend * 1.1 + rnd() * 1.2 - (weekend ? -0.35 : 0)).toFixed(2);
    const quality: SleepLog["quality"] =
      hours >= 7.6 ? "Excellent" : hours >= 7 ? "Good" : hours >= 6.2 ? "Fair" : "Poor";

    sleep.push({
      id: `s-${date}`,
      date,
      hours,
      quality,
      bedtime: hours > 7 ? "22:48" : "23:52",
      wakeTime: hours > 7 ? "06:30" : "06:35",
    });

    const steps = Math.round(
      (weekend ? 5200 : 7400) + trend * 1600 + rnd() * 3400 + (hours - 7) * 700,
    );
    const distanceKm = +(steps * 0.00074).toFixed(2);
    const durationMin = Math.round(22 + rnd() * 45);
    activity.push({
      id: `a-${date}`,
      date,
      type: ["Walking", "Running", "Strength", "Cycling", "Yoga"][Math.floor(rnd() * 5)] ?? "Walking",
      durationMin,
      distanceKm,
      calories: Math.round(steps * 0.045 + durationMin * 3.2),
      steps,
      notes: "",
    });

    const calories = Math.round(1650 + rnd() * 620);
    const protein = Math.round(calories * 0.22 / 4);
    const carbs = Math.round(calories * 0.48 / 4);
    const fat = Math.round(calories * 0.3 / 9);
    (["Breakfast", "Lunch", "Dinner", "Snack"] as const).forEach((mealType, k) => {
      const share = [0.24, 0.33, 0.33, 0.1][k] ?? 0.25;
      meals.push({
        id: `m-${date}-${k}`,
        date,
        mealType,
        food: {
          Breakfast: "Oats, banana & yoghurt",
          Lunch: "Jollof rice with grilled chicken",
          Dinner: "Salmon, quinoa & greens",
          Snack: "Almonds & apple",
        }[mealType],
        quantity: "1 serving",
        calories: Math.round(calories * share),
        protein: Math.round(protein * share),
        carbs: Math.round(carbs * share),
        fat: Math.round(fat * share),
      });
    });

    // Mood is modelled as a function of sleep + activity + nutrition adherence.
    const nutritionFit = 1 - Math.min(1, Math.abs(calories - 2200) / 900);
    const moodScore = Math.max(
      3,
      Math.min(
        10,
        +(
          3.4 +
          (hours - 6) * 1.15 +
          (steps / 10000) * 2.1 +
          nutritionFit * 1.1 +
          rnd() * 0.6
        ).toFixed(1),
      ),
    );
    const stress = Math.max(1, Math.min(10, +(11 - moodScore - rnd() * 1.2).toFixed(1)));
    mood.push({
      id: `mo-${date}`,
      date,
      mood: moodScore,
      stress,
      energy: Math.max(1, Math.min(10, +(moodScore * 0.7 + nutritionFit * 3).toFixed(1))),
      journal: i === DAYS.length - 1 ? "Slept well and walked at dawn. Felt clear-headed." : "",
    });
  });

  return { sleep, mood, activity, meals };
}

const series = buildSeries();

export const seedUser: User = {
  id: "u-1",
  fullName: "Prince Karikari",
  email: "prince.karikari@example.com",
  role: "user",
  joinedAt: "2026-01-14",
  status: "active",
  lastActive: "Today",
  records: 486,
};

export const seedProfile: HealthProfile = {
  age: 23,
  gender: "Male",
  heightCm: 178,
  weightKg: 72,
  primaryGoal: "Improve overall wellness",
  activityPreference: "Running & strength",
  sleepTargetHours: 7.5,
  calorieTarget: 2200,
  stepTarget: 10000,
  wellnessPreferences: ["Mindfulness", "Hydration", "Consistent bedtime"],
};

export const seedActivity = series.activity;
export const seedMeals = series.meals;
export const seedMood = series.mood;
export const seedSleep = series.sleep;

export const seedHabits: Habit[] = [
  { id: "h1", name: "Drink 2.5L water", frequency: "Daily", target: "8 glasses", color: "var(--sky)", streak: 8, history: {} },
  { id: "h2", name: "Move 30 minutes", frequency: "Daily", target: "30 min", color: "var(--salmon)", streak: 12, history: {} },
  { id: "h3", name: "Read 20 pages", frequency: "Daily", target: "20 pages", color: "var(--butter)", streak: 5, history: {} },
  { id: "h4", name: "Meditate", frequency: "Daily", target: "10 min", color: "var(--periwinkle)", streak: 3, history: {} },
  { id: "h5", name: "Sleep before 11 PM", frequency: "Daily", target: "23:00", color: "var(--mint)", streak: 6, history: {} },
];

// Fill 60 days of habit history deterministically.
const hrnd = seeded(881);
seedHabits.forEach((h, idx) => {
  lastNDays(60).forEach((d, i) => {
    const done = hrnd() > (idx === 3 ? 0.42 : 0.24);
    h.history[d] = i === 59 ? idx !== 3 : done;
  });
});

export const seedGoals: Goal[] = [
  { id: "g1", title: "Walk 10,000 steps", domain: "activity", period: "Daily", target: 10000, current: 7842, unit: "steps", deadline: "Today" },
  { id: "g2", title: "Sleep 7+ hours", domain: "sleep", period: "Daily", target: 7, current: 6.8, unit: "hours", deadline: "Today" },
  { id: "g3", title: "Stay under 2,200 kcal", domain: "nutrition", period: "Daily", target: 2200, current: 1850, unit: "kcal", deadline: "Today" },
  { id: "g4", title: "Keep stress under 5", domain: "mind", period: "Weekly", target: 5, current: 4, unit: "score", deadline: "Sunday" },
  { id: "g5", title: "Complete 30 habit check-ins", domain: "habits", period: "Monthly", target: 30, current: 24, unit: "check-ins", deadline: "End of month" },
  { id: "g6", title: "Run 40 km", domain: "activity", period: "Monthly", target: 40, current: 31.4, unit: "km", deadline: "End of month" },
];

export const seedNotifications: Notification[] = [
  { id: "n1", title: "Goal completed", body: "You hit your 30-minute movement goal.", kind: "goal", time: "12 min ago", read: false },
  { id: "n2", title: "New health insight", body: "Sleep above 7h lifted your mood by 18% this week.", kind: "insight", time: "1 h ago", read: false },
  { id: "n3", title: "Habit reminder", body: "Meditation is still pending for today.", kind: "habit", time: "3 h ago", read: false },
  { id: "n4", title: "Weekly report ready", body: "Your 7-day summary is available in Reports.", kind: "report", time: "Yesterday", read: true },
  { id: "n5", title: "Integration synchronised", body: "Fitbit synced 2,104 new steps.", kind: "sync", time: "Yesterday", read: true },
  { id: "n6", title: "Progress milestone", body: "12-day movement streak — your longest yet.", kind: "goal", time: "2 days ago", read: true },
];

export const seedIntegrations: Integration[] = [
  { id: "i1", name: "Apple Health", icon: "🍎", connected: false, lastSync: null },
  { id: "i2", name: "Google Fit", icon: "🟢", connected: true, lastSync: "Today, 09:15 AM" },
  { id: "i3", name: "Fitbit", icon: "⌚", connected: true, lastSync: "Today, 10:42 AM" },
  { id: "i4", name: "Garmin", icon: "🧭", connected: false, lastSync: null },
];

/* ---------- admin sample data ---------- */

export const adminUsers: User[] = [
  seedUser,
  { id: "u-2", fullName: "Ama Boateng", email: "ama.b@example.com", role: "user", joinedAt: "2026-02-03", status: "active", lastActive: "2 h ago", records: 312 },
  { id: "u-3", fullName: "Kwame Mensah", email: "kwame.m@example.com", role: "user", joinedAt: "2026-02-19", status: "active", lastActive: "Today", records: 208 },
  { id: "u-4", fullName: "Efua Danso", email: "efua.d@example.com", role: "user", joinedAt: "2026-03-08", status: "suspended", lastActive: "18 days ago", records: 94 },
  { id: "u-5", fullName: "Yaw Owusu", email: "yaw.o@example.com", role: "user", joinedAt: "2026-04-01", status: "active", lastActive: "Yesterday", records: 421 },
  { id: "u-6", fullName: "Nana Adjei", email: "nana.a@example.com", role: "admin", joinedAt: "2025-11-22", status: "active", lastActive: "Today", records: 12 },
  { id: "u-7", fullName: "Akosua Frimpong", email: "akosua.f@example.com", role: "user", joinedAt: "2026-05-11", status: "active", lastActive: "4 h ago", records: 176 },
  { id: "u-8", fullName: "Kojo Asante", email: "kojo.a@example.com", role: "user", joinedAt: "2026-06-02", status: "active", lastActive: "3 days ago", records: 58 },
];

export const adminGrowth = [
  { month: "Jan", users: 240, active: 168 },
  { month: "Feb", users: 512, active: 351 },
  { month: "Mar", users: 838, active: 590 },
  { month: "Apr", users: 1204, active: 812 },
  { month: "May", users: 1631, active: 1088 },
  { month: "Jun", users: 2094, active: 1402 },
  { month: "Jul", users: 2586, active: 1743 },
  { month: "Aug", users: 3128, active: 2109 },
];

export const adminModuleUsage = [
  { module: "Activity", logs: 18420 },
  { module: "Nutrition", logs: 15230 },
  { module: "Sleep", logs: 12980 },
  { module: "Habits", logs: 11460 },
  { module: "Mental", logs: 8740 },
];

export const adminSystemAlerts = [
  { label: "API latency (p95)", value: "142 ms", tone: "mint" },
  { label: "Database load", value: "38%", tone: "mint" },
  { label: "Insight engine queue", value: "6 jobs", tone: "butter" },
  { label: "Failed sync jobs (24h)", value: "3", tone: "salmon" },
  { label: "Uptime (30 days)", value: "99.97%", tone: "mint" },
];

export const MEDICAL_DISCLAIMER =
  "This application provides wellness insights for informational purposes and is not a substitute for professional medical advice.";
