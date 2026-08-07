import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Disclaimer } from "@/components/health/primitives";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — WellSync" },
      { name: "description", content: "Sign in to your WellSync health dashboard." },
      { property: "og:title", content: "Login — WellSync" },
      { property: "og:description", content: "Sign in to your unified health dashboard." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

function LoginPage() {
  const { signIn } = useHealthStore();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "prince.karikari@example.com", password: "vitality123" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        next[String(i.path[0])] = i.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      signIn(parsed.data.email);
      setLoading(false);
      toast.success("Welcome back to WellSync");
      navigate({ to: "/app" });
    }, 600);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue tracking your complete health picture."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            placeholder="you@example.com"
          />
          {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            placeholder="••••••••"
          />
          {errors["password"] && <p className="text-xs text-destructive">{errors["password"]}</p>}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> Remember me
          </label>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => toast.info("A password reset link would be emailed to you.")}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to WellSync?{" "}
        <Link to="/register" className="text-foreground underline underline-offset-4">
          Create account
        </Link>
      </p>
    </AuthLayout>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center">
          <Logo />
        </Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
        <Disclaimer className="mt-6 text-center" />
      </div>
    </div>
  );
}
