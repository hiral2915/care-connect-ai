import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Smile, Sparkles, ShieldCheck, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/dental")({
  head: () => ({
    meta: [
      { title: "Dental Care — CareConnect AI" },
      { name: "description", content: "Cleanings, implants, orthodontics and smile makeovers — modern, gentle, premium dental care." },
      { property: "og:title", content: "Dental Care — CareConnect" },
      { property: "og:description", content: "Clean. Clinical. Premium dental care." },
    ],
  }),
  component: DentalPage,
});

const treatments = [
  { title: "Cleaning & Hygiene", body: "Routine scaling, polishing, and oral health check-ups.", price: "from ₹800" },
  { title: "Whitening", body: "Same-day in-chair whitening with sensitivity protection.", price: "from ₹6,500" },
  { title: "Root Canal", body: "Microscope-assisted endodontics, mostly single sitting.", price: "from ₹3,500" },
  { title: "Crowns & Bridges", body: "Zirconia & ceramic crowns with digital impressions.", price: "from ₹6,000" },
  { title: "Orthodontics & Aligners", body: "Metal, ceramic and clear aligner treatment.", price: "from ₹35,000" },
  { title: "Implants & Surgery", body: "Globally certified implant systems by specialists.", price: "from ₹28,000" },
];

function DentalPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-soft via-background to-background" />
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-strong">
              <Smile className="h-3.5 w-3.5" /> Dental Care
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Healthy smiles, built on precision and trust.
            </h1>
            <p className="mt-5 max-w-xl text-muted-foreground">
              Our dental team blends premium technology with a calm, gentle experience.
              From routine cleanings to full-mouth rehabilitation — you're in expert hands.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/book-appointment" className="rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
                Book a dental visit
              </Link>
              <Link to="/doctors" className="rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold">
                Meet the dentists
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
              <Stat icon={ShieldCheck} v="ISO" l="Certified clinic" />
              <Stat icon={Clock} v="Same-day" l="Most treatments" />
              <Stat icon={Sparkles} v="Digital" l="X-ray & scans" />
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[5/4] w-full rounded-3xl border border-border bg-card p-6 shadow-elegant">
              <ToothIllustration />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight">Treatments we offer</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((t) => (
            <article key={t.title} className="rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1">
              <h3 className="font-display text-lg font-bold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-strong">{t.price}</span>
                <Link to="/book-appointment" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  Book <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card sm:p-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Why patients pick us</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Painless, gentle dentistry with modern anesthesia",
              "Transparent quotes — no surprise add-ons",
              "Sterilization meeting international standards",
              "Specialist referrals only when truly needed",
              "EMI options & NGO subsidies for those who qualify",
              "Digital records you can access anytime",
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

function ToothIllustration() {
  return (
    <svg viewBox="0 0 400 320" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.21 264)" />
          <stop offset="100%" stopColor="oklch(0.46 0.22 264)" />
        </linearGradient>
      </defs>
      <rect width="400" height="320" fill="oklch(0.94 0.04 254)" rx="20" />
      <g transform="translate(110 50)">
        <path d="M90 0c50 0 90 35 90 80 0 40-18 60-30 110-8 35-22 60-40 60-12 0-18-12-22-32-4 20-10 32-22 32-18 0-32-25-40-60C14 140 0 120 0 80 0 35 40 0 90 0z" fill="url(#tg)" opacity="0.95" />
        <path d="M55 50c20-15 45-22 70-22 12 0 22 1 30 4" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
      </g>
      <g transform="translate(40 240)" fill="oklch(0.46 0.22 264)" opacity="0.3">
        <circle cx="0" cy="0" r="8" />
        <circle cx="30" cy="-12" r="5" />
        <circle cx="55" cy="0" r="3" />
      </g>
    </svg>
  );
}
