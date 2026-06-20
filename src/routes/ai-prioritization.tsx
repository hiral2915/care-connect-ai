import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useMemo, useState } from "react";
import {
  Sparkles, Sliders, TrendingUp, AlertCircle, Users, IndianRupee,
  Activity, Accessibility, Briefcase, User2, Clock,
} from "lucide-react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/ai-prioritization")({
  head: () => ({
    meta: [
      { title: "AI Priority Tool — CareConnect AI" },
      { name: "description", content: "An AI scoring tool for NGO patient prioritization — fair, transparent and explainable." },
      { property: "og:title", content: "AI Priority Tool" },
      { property: "og:description", content: "Transparent AI for fair NGO triage." },
    ],
  }),
  component: AiPriorityPage,
});

type Inputs = {
  income: number;
  family: number;
  employment: "employed" | "self" | "unemployed" | "informal";
  urgency: number; // 1-10
  age: number;
  disability: "none" | "partial" | "severe";
};

const employmentWeight: Record<Inputs["employment"], number> = {
  employed: 0.4, self: 0.6, informal: 0.85, unemployed: 1,
};
const disabilityWeight: Record<Inputs["disability"], number> = {
  none: 0, partial: 0.6, severe: 1,
};

/** Pure scoring fn (0-100) — explainable and easy to test. */
function score(i: Inputs) {
  // Per-capita income (lower = higher need). Normalize against 8000/pp.
  const perCapita = i.income / Math.max(1, i.family);
  const incomeScore = Math.max(0, Math.min(1, 1 - perCapita / 8000)); // 0..1

  const familyScore = Math.min(1, i.family / 8);
  const employmentScore = employmentWeight[i.employment];
  const urgencyScore = Math.min(1, Math.max(0, i.urgency / 10));
  const ageScore = i.age <= 12 ? 1 : i.age >= 60 ? 0.9 : 0.3;
  const disabilityScore = disabilityWeight[i.disability];

  const factors = [
    { key: "Income (per-capita)", value: incomeScore, weight: 0.30 },
    { key: "Medical urgency", value: urgencyScore, weight: 0.25 },
    { key: "Disability", value: disabilityScore, weight: 0.15 },
    { key: "Employment", value: employmentScore, weight: 0.12 },
    { key: "Family size", value: familyScore, weight: 0.10 },
    { key: "Age vulnerability", value: ageScore, weight: 0.08 },
  ];
  const raw = factors.reduce((s, f) => s + f.value * f.weight, 0);
  const total = Math.round(raw * 100);

  const tier =
    total >= 70 ? "High" : total >= 45 ? "Medium" : "Low";
  const subsidy =
    total >= 85 ? 100 :
    total >= 70 ? 80 :
    total >= 55 ? 60 :
    total >= 40 ? 40 :
    total >= 25 ? 20 : 10;

  return { total, tier, subsidy, factors };
}

function AiPriorityPage() {
  const [inputs, setInputs] = useState<Inputs>({
    income: 12000, family: 4, employment: "informal",
    urgency: 7, age: 52, disability: "none",
  });

  const result = useMemo(() => score(inputs), [inputs]);

  const tierTone =
    result.tier === "High" ? "bg-destructive/10 text-destructive border-destructive/30" :
    result.tier === "Medium" ? "bg-warning/10 text-[oklch(0.5_0.15_75)] border-warning/30" :
    "bg-success/10 text-[oklch(0.5_0.14_155)] border-success/30";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
              <Sparkles className="h-3.5 w-3.5" /> AI NGO Module
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Patient Priority Scoring
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Enter the patient's situation. The model returns an explainable
              priority score, a tier, and a recommended subsidy %.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            <Clock className="mr-1 inline h-3.5 w-3.5" /> Real-time scoring · explainable weights
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* Inputs */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <Sliders className="h-5 w-5 text-primary-strong" /> Inputs
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <NumberField
                icon={IndianRupee} label="Monthly household income (₹)"
                value={inputs.income}
                onChange={(v) => setInputs((s) => ({ ...s, income: v }))}
                step={500} min={0} max={200000}
              />
              <NumberField
                icon={Users} label="Family size"
                value={inputs.family}
                onChange={(v) => setInputs((s) => ({ ...s, family: v }))}
                step={1} min={1} max={15}
              />
              <SelectField
                icon={Briefcase} label="Employment"
                value={inputs.employment}
                onChange={(v) => setInputs((s) => ({ ...s, employment: v as Inputs["employment"] }))}
                options={[
                  ["employed", "Salaried / employed"],
                  ["self", "Self-employed"],
                  ["informal", "Daily wage / informal"],
                  ["unemployed", "Unemployed"],
                ]}
              />
              <NumberField
                icon={Activity} label="Medical urgency (1–10)"
                value={inputs.urgency}
                onChange={(v) => setInputs((s) => ({ ...s, urgency: Math.max(1, Math.min(10, v)) }))}
                step={1} min={1} max={10}
              />
              <NumberField
                icon={User2} label="Patient age"
                value={inputs.age}
                onChange={(v) => setInputs((s) => ({ ...s, age: v }))}
                step={1} min={0} max={120}
              />
              <SelectField
                icon={Accessibility} label="Disability status"
                value={inputs.disability}
                onChange={(v) => setInputs((s) => ({ ...s, disability: v as Inputs["disability"] }))}
                options={[
                  ["none", "None"],
                  ["partial", "Partial (<70%)"],
                  ["severe", "Severe (≥70%)"],
                ]}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
              <AlertCircle className="mr-1.5 inline h-3.5 w-3.5" />
              This is a decision-support tool. Final approval is always made by a human coordinator after document review.
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority Score</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold text-foreground sm:text-6xl">{result.total}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tierTone}`}>
                    <TrendingUp className="h-3.5 w-3.5" /> {result.tier} priority
                  </span>
                </div>
                <div className="h-32 w-32 shrink-0">
                  <ResponsiveContainer>
                    <RadialBarChart
                      innerRadius="70%"
                      outerRadius="100%"
                      data={[{ name: "score", value: result.total, fill: "var(--primary)" }]}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar background dataKey="value" cornerRadius={20} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-6 rounded-2xl gradient-soft p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Recommended subsidy</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-foreground">{result.subsidy}%</span>
                  <span className="text-sm text-muted-foreground">of treatment cost</span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
                  <div className="h-full rounded-full gradient-brand transition-all" style={{ width: `${result.subsidy}%` }} />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
              <h3 className="font-display text-base font-bold">Factor contribution</h3>
              <p className="text-xs text-muted-foreground">How each input pushed the score up or down.</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer>
                  <BarChart
                    data={result.factors.map((f) => ({
                      name: f.key,
                      contribution: Math.round(f.value * f.weight * 100),
                    }))}
                    layout="vertical"
                    margin={{ left: 24, right: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                    <YAxis dataKey="name" type="category" width={130} stroke="var(--muted-foreground)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="contribution" fill="var(--primary)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Future feature */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-dashed border-primary/30 bg-primary-soft/40 p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                Coming soon
              </span>
              <h3 className="mt-3 font-display text-2xl font-bold">AI Treatment Recommendation & Recovery Planner</h3>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                A next-generation module that suggests evidence-based treatment paths and personalized recovery timelines
                from patient history, imaging notes and assessment data.
              </p>
            </div>
            <button disabled className="cursor-not-allowed rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground opacity-70">
              Notify me
            </button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function NumberField({
  icon: Icon, label, value, onChange, step, min, max,
}: { icon: any; label: string; value: number; onChange: (v: number) => void; step: number; min: number; max: number }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      />
    </label>
  );
}

function SelectField({
  icon: Icon, label, value, onChange, options,
}: { icon: any; label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
}
