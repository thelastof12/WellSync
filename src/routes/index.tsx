import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Apple,
  ArrowRight,
  Brain,
  CalendarCheck,
  Moon,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Disclaimer, Eyebrow, Pill, Ring } from "@/components/health/primitives";
import { TrendArea } from "@/components/health/charts";
import { lastNDays } from "@/lib/health-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WellSync — Understand Your Health as One Complete Picture" },
      {
        name: "description",
        content:
          "Track activity, nutrition, mental well-being, sleep and habits in one intelligent platform, and discover how they influence each other.",
      },
      { property: "og:title", content: "WellSync — Your health, connected." },
      {
        property: "og:description",
        content:
          "One platform for your complete health picture: activity, nutrition, mind, sleep and habits with AI-powered cross-domain insights.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Activity,
    color: "var(--salmon)",
    title: "Physical Activity",
    body: "Track steps, workouts, distance and calories burned across every session.",
  },
  {
    icon: Apple,
    color: "var(--butter)",
    title: "Nutrition",
    body: "Record meals, calories and macronutrients with daily and weekly trends.",
  },
  {
    icon: Brain,
    color: "var(--periwinkle)",
    title: "Mental Well-being",
    body: "Log mood, stress and private journal entries in a calm, supportive space.",
  },
  {
    icon: Moon,
    color: "var(--sky)",
    title: "Sleep",
    body: "Monitor duration, quality, bedtime consistency and weekly sleep patterns.",
  },
  {
    icon: CalendarCheck,
    color: "var(--mint)",
    title: "Habits",
    body: "Build routines, keep streaks alive and see completion rates at a glance.",
  },
];

const STEPS = [
  { n: "01", title: "Create Your Profile", body: "Share your basics, goals and preferences in a two-minute setup." },
  { n: "02", title: "Track Your Health", body: "Log activity, meals, mood, sleep and habits — or sync a wearable." },
  { n: "03", title: "Discover Your Patterns", body: "See how sleep, movement and nutrition shape how you feel." },
  { n: "04", title: "Improve Your Progress", body: "Follow personalised wellness suggestions and watch goals close." },
];

function Landing() {
  const demo = lastNDays(14).map((date, i) => ({
    date,
    sleep: +(6.3 + Math.sin(i / 2.4) * 0.7 + i * 0.05).toFixed(1),
    mood: +(6.4 + Math.sin(i / 2.4) * 1.1 + i * 0.07).toFixed(1),
  }));

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3.5 sm:px-6">
          <Link to="/" className="min-w-0">
            <Logo />
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <nav className="mr-2 hidden items-center gap-1 md:flex">
              {[
                { href: "#features", label: "Features" },
                { href: "#how", label: "How It Works" },
                { href: "#about", label: "About" },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <Pill color="var(--mint)">One platform. Your complete health picture.</Pill>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
              Understand Your Health as One Complete Picture.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
              Track your activity, nutrition, mental well-being, sleep and habits in one intelligent
              platform — then see how each one shapes the others.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { k: "5", v: "Health domains" },
                { k: "AI", v: "Insight engine" },
                { k: "4", v: "Wearable platforms" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-2xl font-bold">{s.k}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="rounded-[34px] border border-border bg-background p-4 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
            <div className="grid grid-cols-4 gap-3">
              <div
                className="col-span-4 rounded-3xl border p-4"
                style={{ background: "linear-gradient(160deg,#1D2620 0%, #171717 60%)", borderColor: "#253328" }}
              >
                <Eyebrow>Recovery battery</Eyebrow>
                <div className="mt-3 flex items-center gap-4">
                  <Ring value={82} size={86} label="82%" />
                  <div className="min-w-0">
                    <div className="font-display text-sm font-bold uppercase">Fully charged</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sleep, movement and mood are aligned today.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-span-2 rounded-3xl border border-border bg-card p-4">
                <Eyebrow className="!text-[color:var(--salmon)]">Steps</Eyebrow>
                <div className="font-display mt-2 text-2xl font-bold">7,842</div>
                <div className="mt-3 h-1.5 rounded-full bg-raised">
                  <div className="h-full w-[78%] rounded-full" style={{ background: "var(--salmon)" }} />
                </div>
              </div>
              <div className="col-span-2 rounded-3xl border p-4" style={{ background: "linear-gradient(160deg,#20223A 0%, #17171B 65%)", borderColor: "#2A2C48" }}>
                <Eyebrow className="!text-[color:var(--periwinkle)]">Sleep</Eyebrow>
                <div className="font-display mt-2 text-2xl font-bold">7h 32m</div>
                <div className="font-mono mt-2 text-[11px] text-muted-foreground">Quality · Good</div>
              </div>
              <div className="col-span-4 rounded-3xl border border-border bg-card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <Eyebrow>Sleep vs mood — 14 days</Eyebrow>
                  <Pill color="var(--mint)">r = 0.71</Pill>
                </div>
                <TrendArea
                  height={140}
                  data={demo}
                  series={[
                    { key: "sleep", name: "Sleep (h)", color: "var(--sky)" },
                    { key: "mood", name: "Mood", color: "var(--periwinkle)" },
                  ]}
                />
              </div>
              <div className="col-span-4 rounded-3xl border p-4" style={{ background: "linear-gradient(120deg,#2A2440,#1B1B1D 55%)", borderColor: "#382F55" }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: "var(--periwinkle)" }} />
                  <Eyebrow>AI insight</Eyebrow>
                </div>
                <p className="font-display mt-2 text-sm font-semibold leading-snug">
                  “Your mood scores are 18% higher on days you sleep past 7 hours.”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <Eyebrow>Five domains, one system</Eyebrow>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Everything your health touches</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Most apps track a single dimension. WellSync brings all five together so nothing about
          your well-being lives in isolation.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-3xl border border-border bg-card p-6">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: `color-mix(in oklab, ${f.color} 16%, transparent)` }}
              >
                <f.icon className="h-5 w-5" style={{ color: f.color }} />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}

          <article
            className="rounded-3xl border p-6"
            style={{ background: "linear-gradient(120deg,#2A2440,#1B1B1D 55%)", borderColor: "#382F55" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "color-mix(in oklab, var(--periwinkle) 20%, transparent)" }}
            >
              <Waypoints className="h-5 w-5" style={{ color: "var(--periwinkle)" }} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <h3 className="text-base font-semibold">Connected Insights</h3>
              <Pill color="var(--periwinkle)">Flagship</Pill>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Understand how different aspects of your health influence each other — sleep and mood,
              activity and energy, stress and recovery.
            </p>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 border-y border-border bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">From scattered data to clarity</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-3xl border border-border bg-card p-6">
                <div className="font-mono text-xs" style={{ color: "var(--mint)" }}>
                  {s.n}
                </div>
                <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Eyebrow>About the project</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Built to solve fragmented health data
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Existing tools split health into disconnected silos: one app for steps, another for
              meals, another for sleep. WellSync is a comprehensive health and wellness management
              system that unifies the five domains, analyses cross-domain relationships, and returns
              personalised, non-clinical wellness insights.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The platform is structured as a responsive web client backed by a REST API, relational
              storage for health records, JWT authentication, and an analytics layer for the insight
              engine — with service interfaces prepared for Apple Health, Google Fit, Fitbit and
              Garmin.
            </p>
            <div className="mt-6">
              <Button asChild className="rounded-full px-6">
                <Link to="/register">Create your account</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { t: "Fragmented data", v: "Unified in one dashboard" },
              { t: "No cross-domain view", v: "Correlation engine" },
              { t: "Generic advice", v: "Personalised insights" },
              { t: "Weak habit tracking", v: "Streaks & heat maps" },
            ].map((c) => (
              <div key={c.t} className="rounded-3xl border border-border bg-card p-5">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {c.t}
                </div>
                <div className="font-display mt-2 text-sm font-bold uppercase tracking-[0.04em]">
                  {c.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Logo />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground">
                Login
              </Link>
              <Link to="/register" className="hover:text-foreground">
                Register
              </Link>
              <Link to="/admin" className="hover:text-foreground">
                Admin
              </Link>
            </div>
          </div>
          <Disclaimer className="mt-6 max-w-2xl" />
          <p className="font-mono mt-4 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            © 2026 WellSync · Your health, connected.
          </p>
        </div>
      </footer>
    </div>
  );
}
