/**
 * CareConnect AI — Register Page
 *
 * Place this file at: src/routes/register.tsx
 * Route: /register
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", phone: "",
  });
  const [error, setError] = useState("");

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
      navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <SiteLayout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-card">
          <div className="mb-8 flex flex-col items-center gap-2 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-brand text-primary-foreground shadow-elegant">
              <HeartHandshake className="h-6 w-6" />
            </span>
            <h1 className="font-display text-2xl font-bold">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Join CareConnect — free for patients
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full name", field: "name" as const, type: "text", placeholder: "Dr. Priya Sharma" },
              { label: "Email", field: "email" as const, type: "email", placeholder: "you@example.com" },
              { label: "Phone (optional)", field: "phone" as const, type: "tel", placeholder: "+91 98765 43210" },
              { label: "Password", field: "password" as const, type: "password", placeholder: "Min. 6 characters" },
              { label: "Confirm password", field: "confirmPassword" as const, type: "password", placeholder: "Re-enter password" },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </label>
                <input
                  type={type}
                  required={field !== "phone"}
                  value={form[field]}
                  onChange={set(field)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/40 transition focus:border-primary focus:ring-2"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-strong hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}