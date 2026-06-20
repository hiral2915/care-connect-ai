import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useState } from "react";
import { Heart, ShieldCheck, Receipt } from "lucide-react";

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
                onChange={(e) => { setCustom(e.target.value); setAmount(Number(e.target.value) || 0); }}
                className="mt-3 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" placeholder="Full name" />
              <input className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" placeholder="Email" type="email" />
              <input className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 sm:col-span-2" placeholder="Phone (optional)" />
              <input className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 sm:col-span-2" placeholder="PAN (for 80G receipt)" />
            </div>

            <button className="w-full rounded-full gradient-brand px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-1px]">
              Donate ₹{amount.toLocaleString("en-IN")}
            </button>
          </div>
        </div>

        <aside className="space-y-4">
          <Tile icon={Heart} title="Where it goes" body="Treatments only — staff, rent and overheads are funded separately by clinic revenue." />
          <Tile icon={ShieldCheck} title="Verified patients" body="Every recipient is scored by our AI model and reviewed by a coordinator." />
          <Tile icon={Receipt} title="80G receipt" body="Tax-deductible under Section 80G. Receipts emailed within 24 hours." />
        </aside>
      </section>
    </SiteLayout>
  );
}

function Tile({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary-strong">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-display text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
