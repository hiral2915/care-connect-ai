import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Activity, Smile, HeartHandshake, Sparkles, ShieldCheck, Users,
  Stethoscope, ArrowRight, Star, CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CareConnect AI — Dental, Physio & NGO Care" },
      { name: "description", content: "Modern clinic management with AI-powered NGO patient assistance — compassionate care for everyone." },
      { property: "og:title", content: "CareConnect AI — Clinic + NGO Care" },
      { property: "og:description", content: "AI-driven, equitable healthcare for every patient." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <ClinicOverview />
      <FeaturedServices />
      <NgoImpact />
      <DoctorsPreview />
      <Testimonials />
      <DonationCta />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 gradient-soft -z-10" />
      <div className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered NGO support
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Compassionate care,<br />
            <span className="bg-gradient-to-r from-primary-strong to-primary bg-clip-text text-transparent">
              powered by intelligence.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            CareConnect AI brings together a modern dental & physiotherapy clinic
            with an NGO program that uses AI to prioritize who needs help most —
            so quality care reaches every family.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-2 rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:translate-y-[-1px]"
            >
              Book an appointment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/ai-prioritization"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <Sparkles className="h-4 w-4 text-primary-strong" /> Try AI Priority Tool
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6">
            {[
              { v: "12K+", l: "Patients served" },
              { v: "850+", l: "NGO-sponsored" },
              { v: "4.9★", l: "Patient rating" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.v}</dt>
                <dd className="text-xs text-muted-foreground sm:text-sm">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative">
          <div className="relative grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <FloatingCard
                icon={<Smile className="h-5 w-5" />}
                tone="dental"
                title="Dental Care"
                body="Cleanings, implants, smile makeovers."
              />
              <FloatingCard
                icon={<HeartHandshake className="h-5 w-5" />}
                tone="brand"
                title="NGO Assist"
                body="Subsidized treatment for those in need."
              />
            </div>
            <div className="mt-10 space-y-4">
              <FloatingCard
                icon={<Activity className="h-5 w-5" />}
                tone="physio"
                title="Physiotherapy"
                body="Recovery, mobility, sports rehab."
              />
              <FloatingCard
                icon={<Sparkles className="h-5 w-5" />}
                tone="brand"
                title="AI Priority"
                body="Smarter, fairer triage in seconds."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingCard({
  icon, title, body, tone,
}: { icon: React.ReactNode; title: string; body: string; tone: "brand" | "dental" | "physio" }) {
  const map = {
    brand: "bg-primary-soft text-primary-strong",
    dental: "bg-[oklch(0.94_0.04_254)] text-[oklch(0.46_0.22_264)]",
    physio: "bg-[oklch(0.95_0.05_145)] text-[oklch(0.55_0.16_145)]",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-1">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${map[tone]}`}>
        {icon}
      </span>
      <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function ClinicOverview() {
  const points = [
    { icon: ShieldCheck, title: "Accredited Clinic", body: "ISO-certified facility with sterile, modern equipment." },
    { icon: Stethoscope, title: "Specialist Doctors", body: "Board-certified dentists & physiotherapists on staff." },
    { icon: Users, title: "Patient-First", body: "Transparent pricing, friendly staff, multilingual care." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">About the clinic</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Healthcare that meets you where you are.
          </h2>
          <p className="mt-4 text-muted-foreground">
            CareConnect runs two specialty practices under one roof and a parallel
            NGO program that quietly funds care for patients who couldn't otherwise
            access it.
          </p>
        </div>
        <div className="grid gap-4 lg:col-span-2 sm:grid-cols-3">
          {points.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedServices() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Services</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Two specialties, one experience</h2>
        </div>
        <Link to="/doctors" className="text-sm font-semibold text-primary-strong hover:underline">
          Meet the doctors →
        </Link>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <ServiceCard
          to="/dental"
          gradient="from-blue-500/15 to-blue-100/40"
          accent="text-[oklch(0.46_0.22_264)] bg-[oklch(0.94_0.04_254)]"
          icon={<Smile className="h-6 w-6" />}
          title="Dental Care"
          body="From routine cleanings to full smile makeovers, our dental team delivers precise, gentle, premium care."
          items={["Cleaning & Whitening", "Root Canal & Crowns", "Orthodontics & Aligners", "Implants & Surgery"]}
        />
        <ServiceCard
          to="/physio"
          gradient="from-emerald-500/15 to-emerald-100/40"
          accent="text-[oklch(0.55_0.16_145)] bg-[oklch(0.95_0.05_145)]"
          icon={<Activity className="h-6 w-6" />}
          title="Physiotherapy"
          body="Rebuild strength, mobility and confidence with evidence-based recovery plans tailored to your body."
          items={["Sports Injury Rehab", "Post-Surgery Recovery", "Back & Neck Pain", "Neuro Rehab"]}
        />
      </div>
    </section>
  );
}

function ServiceCard({
  to, gradient, accent, icon, title, body, items,
}: {
  to: string; gradient: string; accent: string;
  icon: React.ReactNode; title: string; body: string; items: string[];
}) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${gradient} p-8 transition hover:-translate-y-1`}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}>{icon}</span>
      <h3 className="mt-5 font-display text-2xl font-bold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary-strong" /> {i}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
        Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function NgoImpact() {
  return (
    <section className="bg-secondary py-16 text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">NGO Impact</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            AI decides nothing alone — it just makes fairness scalable.
          </h2>
          <p className="mt-4 text-secondary-foreground/75">
            Every NGO application is scored on income, family size, urgency and
            disability — then reviewed by our team. The result: subsidies reach
            the families who need them most, faster.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/ai-prioritization" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Try the AI tool
            </Link>
            <Link to="/ngo" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-secondary-foreground hover:bg-white/5">
              Learn how it works
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { v: "₹42L", l: "Care funded this year" },
            { v: "850+", l: "Sponsored patients" },
            { v: "94%", l: "Application accuracy" },
            { v: "<2 days", l: "Avg. decision time" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-display text-3xl font-bold text-primary">{s.v}</div>
              <div className="mt-1 text-sm text-secondary-foreground/70">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DoctorsPreview() {
  const doctors = [
    { name: "Dr. Anaya Sharma", role: "Senior Dentist", img: "AS", spec: "Implants · Cosmetic" },
    { name: "Dr. Rohan Patil", role: "Physiotherapist", img: "RP", spec: "Sports · Spine" },
    { name: "Dr. Meera Joshi", role: "Orthodontist", img: "MJ", spec: "Aligners · Braces" },
    { name: "Dr. Karan Mehta", role: "Neuro Physio", img: "KM", spec: "Stroke · Rehab" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Our doctors</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">Specialists you can trust</h2>
        </div>
        <Link to="/doctors" className="hidden text-sm font-semibold text-primary-strong sm:inline">View all →</Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {doctors.map((d) => (
          <div key={d.name} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-brand font-display text-xl font-bold text-primary-foreground">
              {d.img}
            </div>
            <h3 className="mt-4 font-display text-base font-bold">{d.name}</h3>
            <p className="text-xs text-primary-strong">{d.role}</p>
            <p className="mt-2 text-sm text-muted-foreground">{d.spec}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Priya R.", role: "Patient", body: "The dental team made me feel calm from the first visit. Honest pricing and zero pressure." },
    { name: "Suresh K.", role: "NGO Beneficiary", body: "I never thought I could afford physiotherapy after my accident. CareConnect's NGO program changed my life." },
    { name: "Dr. Amit V.", role: "Visiting Specialist", body: "The AI priority scoring is genuinely thoughtful — it surfaces the cases I'd want to see first." },
  ];
  return (
    <section className="bg-muted/50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 font-display text-3xl font-bold tracking-tight">What people say</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex gap-0.5 text-primary-strong">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground">"{t.body}"</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{t.name}</span>{" "}
                <span className="text-muted-foreground">· {t.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function DonationCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl gradient-brand p-10 text-primary-foreground shadow-elegant sm:p-14">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Your donation funds real treatments — not overheads.
            </h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/85">
              Every rupee is matched to a verified patient via our AI prioritization
              process. You'll get a report showing exactly where your contribution went.
            </p>
          </div>
          <Link
            to="/donate"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground"
          >
            Donate now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
