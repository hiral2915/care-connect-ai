import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { HandHeart, Sparkles, Users, FileCheck, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/ngo")({
  head: () => ({
    meta: [
      { title: "NGO Support — CareConnect AI" },
      { name: "description", content: "How our AI-driven NGO program decides who gets subsidized care, and how you can apply." },
      { property: "og:title", content: "NGO Support — CareConnect" },
      { property: "og:description", content: "Compassionate, transparent, AI-assisted." },
    ],
  }),
  component: NgoPage,
});

const steps = [
  { icon: FileCheck, title: "Apply", body: "Fill a short form: income, family, medical urgency, age." },
  { icon: Sparkles, title: "AI scores", body: "Our model produces a fair priority score and subsidy %." },
  { icon: Users, title: "Team reviews", body: "A coordinator verifies documents and meets you." },
  { icon: HandHeart, title: "Treatment", body: "You get treated. Donors get a transparent report." },
];

function NgoPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">NGO Support</p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Care that finds the people who need it most.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          We use a transparent AI model — not gut feel — to decide subsidies.
          Every applicant is scored on objective criteria and reviewed by a human.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="absolute right-4 top-4 font-display text-3xl font-bold text-primary-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
            <h2 className="font-display text-2xl font-bold">Eligibility (at a glance)</h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Monthly household income below ₹25,000 (varies by family size)",
                "Documented medical need: dental or physio",
                "Indian resident with valid ID",
                "Disability, senior citizen and child cases get priority weighting",
              ].map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-primary-strong" /> {p}
                </li>
              ))}
            </ul>
            <Link to="/ai-prioritization" className="mt-8 inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
              <Sparkles className="h-4 w-4" /> Check your priority score
            </Link>
          </div>
          <div className="rounded-3xl border border-border bg-secondary p-8 text-secondary-foreground shadow-card">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-xl font-bold">Impact (this year)</h3>
            <dl className="mt-5 space-y-3 text-sm">
              <Row k="Patients sponsored" v="850+" />
              <Row k="Care funded" v="₹42 L" />
              <Row k="Avg. decision time" v="< 2 days" />
              <Row k="Accuracy vs. review" v="94%" />
            </dl>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
      <dt className="text-secondary-foreground/70">{k}</dt>
      <dd className="font-display text-lg font-bold text-primary">{v}</dd>
    </div>
  );
}
