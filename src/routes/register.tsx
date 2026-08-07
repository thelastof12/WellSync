import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "./login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHealthStore } from "@/lib/health-store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — WellSync" },
      {
        name: "description",
        content: "Create your WellSync account and unify activity, nutrition, mind, sleep and habits.",
      },
      { property: "og:title", content: "Create account — WellSync" },
      { property: "og:description", content: "Start tracking your complete health picture." },
    ],
  }),
  component: RegisterPage,
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email("Enter a valid email address").max(255),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128)
      .regex(/[0-9]/, "Include at least one number"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

function RegisterPage() {
  const { signIn } = useHealthStore();
  const navigate = useNavigate();
  const [values, setValues] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues({ ...values, [k]: e.target.value });

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
      signIn(parsed.data.email, parsed.data.fullName);
      setLoading(false);
      toast.success("Account created — let's set up your health profile");
      navigate({ to: "/onboarding" });
    }, 600);
  };

  const fields: Array<{ k: keyof typeof values; label: string; type: string; ph: string }> = [
    { k: "fullName", label: "Full name", type: "text", ph: "Prince Karikari" },
    { k: "email", label: "Email", type: "email", ph: "you@example.com" },
    { k: "password", label: "Password", type: "password", ph: "At least 8 characters" },
    { k: "confirm", label: "Confirm password", type: "password", ph: "Repeat password" },
  ];

  return (
    <AuthLayout title="Create your account" subtitle="Two minutes to your unified health dashboard.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {fields.map((f) => (
          <div key={f.k} className="space-y-1.5">
            <Label htmlFor={f.k}>{f.label}</Label>
            <Input
              id={f.k}
              type={f.type}
              value={values[f.k]}
              onChange={set(f.k)}
              placeholder={f.ph}
            />
            {errors[f.k] && <p className="text-xs text-destructive">{errors[f.k]}</p>}
          </div>
        ))}
        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Get Started"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="text-foreground underline underline-offset-4">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
