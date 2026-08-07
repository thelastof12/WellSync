import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  isoDay,
  seedActivity,
  seedGoals,
  seedHabits,
  seedIntegrations,
  seedMeals,
  seedMood,
  seedNotifications,
  seedProfile,
  seedSleep,
  seedUser,
  type ActivityLog,
  type Goal,
  type Habit,
  type HealthProfile,
  type Integration,
  type MealLog,
  type MoodLog,
  type Notification,
  type SleepLog,
  type User,
} from "./health-data";

/**
 * Application store. When a user is signed in, every read/write goes to the
 * live PostgreSQL database (Lovable Cloud) and Realtime keeps the UI in sync
 * across tabs and devices. Signed out, the seeded demo dataset is used so the
 * marketing/demo experience still works.
 */

interface StoreValue {
  user: User;
  profile: HealthProfile;
  activity: ActivityLog[];
  meals: MealLog[];
  mood: MoodLog[];
  sleep: SleepLog[];
  habits: Habit[];
  goals: Goal[];
  notifications: Notification[];
  integrations: Integration[];
  today: string;
  isAuthed: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<HealthProfile>) => void;
  updateUser: (patch: Partial<User>) => void;
  addActivity: (entry: Omit<ActivityLog, "id">) => void;
  addMeal: (entry: Omit<MealLog, "id">) => void;
  addMood: (entry: Omit<MoodLog, "id">) => void;
  addSleep: (entry: Omit<SleepLog, "id">) => void;
  addHabit: (h: Pick<Habit, "name" | "frequency" | "target" | "color">) => void;
  toggleHabit: (habitId: string, date: string) => void;
  removeHabit: (habitId: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  removeGoal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  toggleIntegration: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const num = (v: unknown, fallback = 0) => (v == null ? fallback : Number(v));

const QUALITY: Array<SleepLog["quality"]> = ["Poor", "Fair", "Good", "Excellent"];
const scoreToQuality = (score: number): SleepLog["quality"] =>
  QUALITY[Math.min(3, Math.max(0, Math.floor((score - 1) / 2.5)))] ?? "Good";
const qualityToScore = (q: SleepLog["quality"]) => (QUALITY.indexOf(q) + 1) * 2.5;

const TABLES = [
  "profiles",
  "health_profiles",
  "physical_activity_logs",
  "nutrition_logs",
  "mental_wellbeing_logs",
  "sleep_logs",
  "habits",
  "habit_logs",
  "notifications",
] as const;

export function HealthStoreProvider({ children }: { children: ReactNode }) {
  const today = isoDay(new Date());

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<User>(seedUser);
  const [profile, setProfile] = useState<HealthProfile>(seedProfile);
  const [activity, setActivity] = useState<ActivityLog[]>(seedActivity);
  const [meals, setMeals] = useState<MealLog[]>(seedMeals);
  const [mood, setMood] = useState<MoodLog[]>(seedMood);
  const [sleep, setSleep] = useState<SleepLog[]>(seedSleep);
  const [habits, setHabits] = useState<Habit[]>(seedHabits);
  const [goals, setGoals] = useState<Goal[]>(seedGoals);
  const [notifications, setNotifications] = useState<Notification[]>(seedNotifications);
  const [integrations, setIntegrations] = useState<Integration[]>(seedIntegrations);

  const userId = session?.user.id ?? null;
  const userIdRef = useRef<string | null>(null);
  userIdRef.current = userId;

  // ---- auth session ----------------------------------------------------
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // ---- load everything from PostgreSQL ---------------------------------
  const refresh = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) return;
    const [p, hp, act, nut, mind, slp, hab, hlogs, notif] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", id).maybeSingle(),
      supabase.from("health_profiles").select("*").eq("user_id", id).maybeSingle(),
      supabase.from("physical_activity_logs").select("*").eq("user_id", id).order("date"),
      supabase.from("nutrition_logs").select("*").eq("user_id", id).order("date"),
      supabase.from("mental_wellbeing_logs").select("*").eq("user_id", id).order("date"),
      supabase.from("sleep_logs").select("*").eq("user_id", id).order("date"),
      supabase.from("habits").select("*").eq("user_id", id).eq("active", true),
      supabase.from("habit_logs").select("*").eq("user_id", id),
      supabase.from("notifications").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    ]);

    const prow = p.data;
    if (prow) {
      setUser((u) => ({
        ...u,
        id,
        fullName: prow.full_name || u.fullName,
        email: prow.email ?? u.email,
        joinedAt: prow.created_at?.slice(0, 10) ?? u.joinedAt,
      }));
      setProfile((prev) => ({ ...prev, gender: prow.gender ?? prev.gender }));
    }
    const hrow = hp.data;
    if (hrow) {
      setProfile((prev) => ({
        ...prev,
        heightCm: num(hrow.height, prev.heightCm),
        weightKg: num(hrow.weight, prev.weightKg),
        primaryGoal: hrow.primary_goal ?? prev.primaryGoal,
        activityPreference: hrow.activity_level ?? prev.activityPreference,
        ...((hrow.preferences ?? {}) as Partial<HealthProfile>),
      }));
    }

    setActivity(
      (act.data ?? []).map((r) => ({
        id: r.log_id,
        date: r.date,
        type: r.activity_type,
        durationMin: num(r.duration_minutes),
        distanceKm: num(r.distance_km),
        calories: num(r.calories_burned),
        steps: num(r.steps),
        ...(r.notes ? { notes: r.notes } : {}),
      })),
    );

    setMeals(
      (nut.data ?? []).map((r) => ({
        id: r.log_id,
        date: r.date,
        mealType: (r.meal_type ?? "Snack") as MealLog["mealType"],
        food: r.food ?? "Logged meal",
        quantity: r.quantity ?? "1 serving",
        calories: num(r.total_calories),
        protein: num(r.protein_g),
        carbs: num(r.carbs_g),
        fat: num(r.fat_g),
      })),
    );

    setMood(
      (mind.data ?? []).map((r) => ({
        id: r.log_id,
        date: r.date,
        mood: num(r.mood_score, 5),
        stress: num(r.stress_level, 5),
        energy: num(r.energy, 5),
        ...(r.journal_entry ? { journal: r.journal_entry } : {}),
      })),
    );

    setSleep(
      (slp.data ?? []).map((r) => ({
        id: r.log_id,
        date: r.date,
        hours: num(r.sleep_duration_hours),
        quality: scoreToQuality(num(r.sleep_quality_score, 6)),
        bedtime: r.bedtime ?? "23:00",
        wakeTime: r.wake_time ?? "07:00",
      })),
    );

    const logs = hlogs.data ?? [];
    setHabits(
      (hab.data ?? []).map((h) => {
        const history: Record<string, boolean> = {};
        logs
          .filter((l) => l.habit_id === h.habit_id && l.completed)
          .forEach((l) => {
            history[l.date] = true;
          });
        let streak = 0;
        const cursor = new Date(today + "T00:00:00");
        while (history[isoDay(cursor)]) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        }
        return {
          id: h.habit_id,
          name: h.name,
          frequency: (h.frequency === "Daily" ? "Daily" : "3x / week") as Habit["frequency"],
          target: h.target_value ? `${h.target_value} ${h.unit ?? ""}`.trim() : (h.description ?? ""),
          color: h.color ?? "mint",
          streak,
          history,
        };
      }),
    );

    setNotifications(
      (notif.data ?? []).map((n) => ({
        id: n.notification_id,
        title: n.title,
        body: n.message,
        kind: (n.type as Notification["kind"]) ?? "insight",
        time: new Date(n.created_at).toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }),
        read: n.read,
      })),
    );
  }, [today]);

  useEffect(() => {
    if (!userId) return;
    void refresh();
  }, [userId, refresh]);

  // ---- realtime --------------------------------------------------------
  useEffect(() => {
    if (!userId) return;
    let channel = supabase.channel(`wellsync-${userId}`);
    TABLES.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `user_id=eq.${userId}` },
        () => void refresh(),
      );
    });
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  // ---- auth actions ----------------------------------------------------
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { full_name: fullName },
      },
    });
    return error ? { error: error.message } : {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<StoreValue>(() => {
    const authed = Boolean(userId);
    const db = (local: () => void, remote: () => unknown) => {
      if (authed) {
        void Promise.resolve(remote());
      } else {
        local();
      }
    };

    return {
      user,
      profile,
      activity,
      meals,
      mood,
      sleep,
      habits,
      goals,
      notifications,
      integrations,
      today,
      isAuthed: authed,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile: (patch) => {
        setProfile((p) => ({ ...p, ...patch }));
        if (userId) {
          void supabase
            .from("health_profiles")
            .update({
              height: patch.heightCm ?? profile.heightCm,
              weight: patch.weightKg ?? profile.weightKg,
              preferences: { ...profile, ...patch } as never,
            })
            .eq("user_id", userId);
        }
      },
      updateUser: (patch) => {
        setUser((u) => ({ ...u, ...patch }));
        if (userId && patch.fullName) {
          void supabase.from("profiles").update({ full_name: patch.fullName }).eq("user_id", userId);
        }
      },
      addActivity: (entry) =>
        db(
          () => setActivity((a) => [...a, { ...entry, id: uid() }]),
          () =>
            supabase.from("physical_activity_logs").insert({
              user_id: userId!,
              activity_type: entry.type,
              date: entry.date,
              duration_minutes: entry.durationMin,
              distance_km: entry.distanceKm,
              steps: entry.steps,
              calories_burned: entry.calories,
              notes: entry.notes ?? null,
            }),
        ),
      addMeal: (entry) =>
        db(
          () => setMeals((m) => [...m, { ...entry, id: uid() }]),
          () =>
            supabase.from("nutrition_logs").insert({
              user_id: userId!,
              date: entry.date,
              meal_type: entry.mealType,
              food: entry.food,
              quantity: entry.quantity,
              total_calories: entry.calories,
              protein_g: entry.protein,
              carbs_g: entry.carbs,
              fat_g: entry.fat,
            }),
        ),
      addMood: (entry) =>
        db(
          () =>
            setMood((m) => [...m.filter((x) => x.date !== entry.date), { ...entry, id: uid() }]),
          () =>
            supabase.from("mental_wellbeing_logs").upsert(
              {
                user_id: userId!,
                date: entry.date,
                mood_score: entry.mood,
                stress_level: entry.stress,
                energy: entry.energy,
                journal_entry: entry.journal ?? null,
              },
              { onConflict: "user_id,date" },
            ),
        ),
      addSleep: (entry) =>
        db(
          () =>
            setSleep((s) => [...s.filter((x) => x.date !== entry.date), { ...entry, id: uid() }]),
          () =>
            supabase.from("sleep_logs").upsert(
              {
                user_id: userId!,
                date: entry.date,
                sleep_duration_hours: entry.hours,
                sleep_quality_score: Math.round(qualityToScore(entry.quality)),
                bedtime: entry.bedtime,
                wake_time: entry.wakeTime,
              },
              { onConflict: "user_id,date" },
            ),
        ),
      addHabit: (h) =>
        db(
          () => setHabits((list) => [...list, { ...h, id: uid(), streak: 0, history: {} }]),
          () =>
            supabase.from("habits").insert({
              user_id: userId!,
              name: h.name,
              description: h.target,
              frequency: h.frequency === "Daily" ? "Daily" : "Weekly",
              color: h.color,
            }),
        ),
      removeHabit: (habitId) =>
        db(
          () => setHabits((list) => list.filter((h) => h.id !== habitId)),
          () => supabase.from("habits").delete().eq("habit_id", habitId),
        ),
      toggleHabit: (habitId, date) => {
        const current = habits.find((h) => h.id === habitId);
        const next = !current?.history[date];
        if (!userId) {
          setHabits((list) =>
            list.map((h) => {
              if (h.id !== habitId) return h;
              const history = { ...h.history, [date]: next };
              let streak = 0;
              const cursor = new Date(date + "T00:00:00");
              while (history[isoDay(cursor)]) {
                streak += 1;
                cursor.setDate(cursor.getDate() - 1);
              }
              return { ...h, history, streak };
            }),
          );
          return;
        }
        void supabase
          .from("habit_logs")
          .upsert(
            { user_id: userId, habit_id: habitId, date, completed: next },
            { onConflict: "habit_id,date" },
          );
      },
      addGoal: (g) => setGoals((list) => [...list, { ...g, id: uid() }]),
      removeGoal: (id) => setGoals((list) => list.filter((g) => g.id !== id)),
      markNotificationRead: (id) =>
        db(
          () =>
            setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
          () => supabase.from("notifications").update({ read: true }).eq("notification_id", id),
        ),
      markAllRead: () =>
        db(
          () => setNotifications((list) => list.map((n) => ({ ...n, read: true }))),
          () => supabase.from("notifications").update({ read: true }).eq("user_id", userId!),
        ),
      toggleIntegration: (id) =>
        setIntegrations((list) =>
          list.map((i) =>
            i.id === id
              ? {
                  ...i,
                  connected: !i.connected,
                  lastSync: !i.connected
                    ? new Date().toLocaleString("en-US", { hour: "numeric", minute: "2-digit" })
                    : null,
                }
              : i,
          ),
        ),
    };
  }, [
    user,
    profile,
    activity,
    meals,
    mood,
    sleep,
    habits,
    goals,
    notifications,
    integrations,
    today,
    userId,
    loading,
    signIn,
    signUp,
    signOut,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useHealthStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useHealthStore must be used inside HealthStoreProvider");
  return ctx;
}
