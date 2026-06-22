/**
 * CareConnect AI — Donate Page (Backend-connected version)
 *
 * This REPLACES src/routes/donate.tsx in the existing frontend.
 * The UI is identical — the only change is wiring the form to the real API.
 *
 * WHAT CHANGED vs original:
 *   - Added import of donationApi
 *   - handleDonate() now calls donationApi.donate() instead of console.log
 *   - Added success/error state display
 *   - Added loading state on button
 */

import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useState } from "react";
import { Heart, ShieldCheck, Receipt } from "lucide-react";
import { donationApi } from "@/lib/api";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — CareConnect AI" },
      { name: "description", content: "Every rupee is matched to a verified patient via AI prioritization. 80G tax benefits." },
      { property: "og:title", content: "Donate — CareConnect" },
      { property: "og:description", content: "Fund real treatments, transparently." },
    ],
  }),
  component: DonatePage,
});

const presets = [500, 1000, 2500, 5000, 10000];

function DonatePage() {
  const [amount, setAmount] = useState(1000);
  const [custom, setCustom] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = custom ? parseFloat(custom) : amount;

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Please enter your name"); return; }
    if (finalAmount < 1) { setError("Please enter a valid donation amount"); return; }
    setError("");
    setLoading(true);
    try {
      await donationApi.donate({
        donor_name: form.name,
        donor_email: form.email || undefined,
        amount: finalAmount,
        message: form.message || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Donation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-green-100 text-green-600">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold">Thank you, {form.name}!</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Your donation of ₹{finalAmount.toLocaleString("en-IN")} has been recorded.
            You'll receive an 80G receipt at {form.email || "the email you provided"}.
          </p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Donate</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Fund a real treatment. See exactly where it goes.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            100% of your donation is matched to a verified patient through our
            AI prioritization process. You'll receive a follow-up report and an
            80G receipt for tax benefits.
          </p>

          <div className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Choose amount (₹)
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setAmount(p); setCustom(""); }}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      amount === p && !custom
                        ? "border-primary bg-primary-soft text-primary-strong"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                  >
                    ₹{p.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Custom amount"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="mt-3 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <form onSubmit={handleDonate} className="space-y-4">
              <input
                required
                placeholder="Your name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <input
                type="email"
                placeholder="Email (for 80G receipt)"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <textarea
                rows={2}
                placeholder="Message (optional)"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:opacity-60"
              >
                {loading
                  ? "Processing…"
                  : `Donate ₹${(finalAmount || 0).toLocaleString("en-IN")}`}
              </button>
            </form>
          </div>
        </div>

        {/* Right column — trust badges (unchanged from original) */}
        <div className="flex flex-col gap-6 lg:justify-center">
          {[
            { icon: Receipt, title: "80G Tax Benefit", body: "All donations are eligible. Receipt emailed automatically." },
            { icon: ShieldCheck, title: "Fully Transparent", body: "Every rupee tracked via our AI-matched patient ledger." },
            { icon: Heart, title: "Real Impact", body: "View before/after patient stories on our NGO report page." },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-bold">{c.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}