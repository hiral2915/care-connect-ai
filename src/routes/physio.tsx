import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Activity, Dumbbell, HeartPulse, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/physio")({
  head: () => ({
    meta: [
      { title: "Physiotherapy — CareConnect AI" },
      { name: "description", content: "Sports rehab, post-surgery recovery, back & neck pain — evidence-based physiotherapy that helps you move again." },
      { property: "og:title", content: "Physiotherapy — CareConnect" },
      { property: "og:description", content: "Recovery, movement, wellness." },
    ],
  }),
  component: PhysioPage,
});

const programs = [
  { title: "Sports Injury Rehab", body: "Return-to-play programs for athletes and weekend warriors.", price: "from ₹900/session" },
  { title: "Post-Surgery Recovery", body: "Structured plans after knee, hip and shoulder surgeries.", price: "from ₹1,000/session" },
  { title: "Back & Neck Pain", body: "Manual therapy, posture correction and ergonomic coaching.", price: "from ₹800/session" },
  { title: "Neuro Rehabilitation", body: "Stroke, Parkinson's and spinal injury rehab.", price: "from ₹1,200/session" },
  { title: "Pediatric Physio", body: "Developmental delays, cerebral palsy support.", price: "from ₹900/session" },
  { title: "Geriatric Care", body: "Mobility, balance and fall-prevention programs.", price: "from ₹800/session" },
];

function PhysioPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-soft via-background to-background" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
              <Activity className="h-3.5 w-3.5" /> Physiotherapy
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Move better. Recover stronger. Live freely.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Our physiotherapists design recovery programs around your goals —
              not generic templates. Whether you're returning to sport or just
              picking up your grandchild without pain, we'll get you there.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book-appointment" className="rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
                Start your recovery
              </Link>
              <Link to="/doctors" className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold">
                Meet the physios
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
              <Stat icon={HeartPulse} v="1:1" l="Personal care" />
              <Stat icon={Clock} v="45 min" l="Average session" />
              <Stat icon={Dumbbell} v="Modern" l="Equipment & tools" />
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[5/4] w-full rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <BodyMovementIllustration />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight">Our programs</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((t) => (
            <article key={t.title} className="rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1">
              <h3 className="font-display text-lg font-bold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-strong">{t.price}</span>
                <Link to="/book-appointment" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  Enroll <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">A program built around you</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Initial assessment with movement screening",
              "Outcome goals you co-design with the physio",
              "Hands-on therapy + guided exercise",
              "Home program with video instructions",
              "Weekly progress reviews",
              "NGO subsidies available based on need",
            ].map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-strong" /> {p}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon: Icon, v, l }: { icon: any; v: string; l: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-primary-strong"><Icon className="h-4 w-4" /></div>
      <div className="mt-1 font-display text-lg font-bold">{v}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}

function BodyMovementIllustration() {
  return (
    <svg viewBox="0 0 400 320" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="pg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.18 145)" />
          <stop offset="100%" stopColor="oklch(0.55 0.16 145)" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="oklch(0.95 0.05 145)" rx="20" />
      <g stroke="url(#pg)" strokeWidth="6" fill="none" strokeLinecap="round">
        <circle cx="200" cy="80" r="22" fill="url(#pg)" />
        <path d="M200 102 V 180" />
        <path d="M200 130 L 140 170" />
        <path d="M200 130 L 260 100" />
        <path d="M200 180 L 165 260" />
        <path d="M200 180 L 240 260" />
      </g>
      <g stroke="oklch(0.55 0.16 145)" strokeWidth="3" fill="none" opacity="0.4">
        <path d="M60 200 Q 100 160 140 200" />
        <path d="M260 100 Q 300 60 340 100" />
      </g>
    </svg>
  );
}
