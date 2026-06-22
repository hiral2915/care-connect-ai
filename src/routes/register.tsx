import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { HeartHandshake, Loader2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      setDone(true);
      setTimeout(() => navigate({ to: "/dashboard" }), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <SiteLayout>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
          <h2 className="font-display text-2xl font-bold">Welcome to CareConnect!</h2>
          <p className="mt-2 text-muted-foreground">
            Your account is ready. Redirecting to your dashboard…
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand text-primary-foreground shadow-elegant">
            <HeartHandshake className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold">Create your account</span>
        </div>
        <h1 className="font-display text-2xl font-bold">Join CareConnect</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary-strong hover:underline">
            Sign in
          </Link>
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {[
            { k: "full_name", label: "Full name", type: "text", required: true },
            { k: "email", label: "Email", type: "email", required: true },
            { k: "phone", label: "Phone (optional)", type: "tel", required: false },
            { k: "password", label: "Password (min 6 chars)", type: "password", required: true },
          ].map((f) => (
            <div key={f.k}>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {f.label}
              </label>
              <input
                type={f.type}
                required={f.required}
                minLength={f.k === "password" ? 6 : undefined}
                value={(form as Record<string, string>)[f.k]}
                onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating account…" : "Create account"}
          </button>
          <p className="text-xs text-muted-foreground">
            By signing up you agree to our terms. New accounts default to the Patient role —
            doctors and admins are assigned by clinic administrators.
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}
