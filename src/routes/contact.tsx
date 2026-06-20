import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CareConnect AI" },
      { name: "description", content: "Book an appointment or reach our team. We respond within a few hours." },
      { property: "og:title", content: "Contact — CareConnect" },
      { property: "og:description", content: "Get in touch with our clinic." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Book an appointment.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Tell us a little about what you need. Our team typically responds within
            a few hours during clinic hours.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); alert("Thanks! We'll be in touch shortly."); }}
            className="mt-8 grid gap-3 rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" required><input required className={inputCls} placeholder="Your name" /></Field>
              <Field label="Phone" required><input required className={inputCls} placeholder="+91 ..." /></Field>
            </div>
            <Field label="Email"><input type="email" className={inputCls} placeholder="you@example.com" /></Field>
            <Field label="Service">
              <select className={inputCls}>
                <option>Dental — Consultation</option>
                <option>Dental — Cleaning</option>
                <option>Dental — Orthodontics</option>
                <option>Physio — Sports rehab</option>
                <option>Physio — Back pain</option>
                <option>Physio — Post-surgery</option>
                <option>NGO support enquiry</option>
              </select>
            </Field>
            <Field label="Preferred date"><input type="date" className={inputCls} /></Field>
            <Field label="Message">
              <textarea className={inputCls + " min-h-28"} placeholder="Tell us what brings you in..." />
            </Field>
            <button className="mt-2 rounded-full gradient-brand px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
              Request appointment
            </button>
          </form>
        </div>

        <aside className="space-y-4">
          <Card icon={MapPin} title="Visit us" body="2nd Floor, Madhuban Plaza, FC Road, Pune 411004" />
          <Card icon={Phone} title="Call" body="+91 98765 43210" />
          <Card icon={Mail} title="Email" body="hello@careconnect.ai" />
          <Card icon={Clock} title="Hours" body="Mon–Sat, 9:00 AM – 8:00 PM · Sun, 10:00 AM – 2:00 PM" />
        </aside>
      </section>
    </SiteLayout>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Card({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
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
