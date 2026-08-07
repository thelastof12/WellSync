import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
 * Client-side application store. All reads/writes for every module funnel
 * through here, which keeps the UI decoupled from the data source. Replacing
 * the seeded arrays with `fetch("/api/...")` calls against the Express API is
 * the only change needed to go live.
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
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
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

export function HealthStoreProvider({ children }: { children: ReactNode }) {
  const today = isoDay(new Date());

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
  const [isAuthed, setAuthed] = useState(true);

  const signIn = useCallback((email: string, name?: string) => {
    setUser((u) => ({ ...u, email, fullName: name?.trim() ? name : u.fullName }));
    setAuthed(true);
  }, []);

  const signOut = useCallback(() => setAuthed(false), []);

  const value = useMemo<StoreValue>(
    () => ({
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
      isAuthed,
      signIn,
      signOut,
      updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
      updateUser: (patch) => setUser((u) => ({ ...u, ...patch })),
      addActivity: (entry) => setActivity((a) => [...a, { ...entry, id: uid() }]),
      addMeal: (entry) => setMeals((m) => [...m, { ...entry, id: uid() }]),
      addMood: (entry) =>
        setMood((m) => [...m.filter((x) => x.date !== entry.date), { ...entry, id: uid() }]),
      addSleep: (entry) =>
        setSleep((s) => [...s.filter((x) => x.date !== entry.date), { ...entry, id: uid() }]),
      addHabit: (h) =>
        setHabits((list) => [...list, { ...h, id: uid(), streak: 0, history: {} }]),
      removeHabit: (habitId) => setHabits((list) => list.filter((h) => h.id !== habitId)),
      toggleHabit: (habitId, date) =>
        setHabits((list) =>
          list.map((h) => {
            if (h.id !== habitId) return h;
            const history = { ...h.history, [date]: !h.history[date] };
            let streak = 0;
            const cursor = new Date(date + "T00:00:00");
            while (history[isoDay(cursor)]) {
              streak += 1;
              cursor.setDate(cursor.getDate() - 1);
            }
            return { ...h, history, streak };
          }),
        ),
      addGoal: (g) => setGoals((list) => [...list, { ...g, id: uid() }]),
      removeGoal: (id) => setGoals((list) => list.filter((g) => g.id !== id)),
      markNotificationRead: (id) =>
        setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n))),
      markAllRead: () => setNotifications((list) => list.map((n) => ({ ...n, read: true }))),
      toggleIntegration: (id) =>
        setIntegrations((list) =>
          list.map((i) =>
            i.id === id
              ? {
                  ...i,
                  connected: !i.connected,
                  lastSync: !i.connected
                    ? new Date().toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : null,
                }
              : i,
          ),
        ),
    }),
    [
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
      isAuthed,
      signIn,
      signOut,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useHealthStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useHealthStore must be used inside HealthStoreProvider");
  return ctx;
}
