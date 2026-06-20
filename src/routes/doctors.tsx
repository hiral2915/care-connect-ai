import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Award } from "lucide-react";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Our Doctors — CareConnect AI" },
      { name: "description", content: "Meet our board-certified dentists and physiotherapists." },
      { property: "og:title", content: "Doctors — CareConnect" },
      { property: "og:description", content: "Specialists you can trust." },
    ],
  }),
  component: DoctorsPage,
});

const doctors = [
  { name: "Dr. Anaya Sharma", role: "Senior Dentist", spec: "Implants · Cosmetic", exp: "12 yrs", initials: "AS" },
  { name: "Dr. Rohan Patil", role: "Physiotherapist", spec: "Sports · Spine", exp: "9 yrs", initials: "RP" },
  { name: "Dr. Meera Joshi", role: "Orthodontist", spec: "Aligners · Braces", exp: "10 yrs", initials: "MJ" },
  { name: "Dr. Karan Mehta", role: "Neuro Physio", spec: "Stroke · Rehab", exp: "8 yrs", initials: "KM" },
  { name: "Dr. Priya Iyer", role: "Endodontist", spec: "Root Canals", exp: "7 yrs", initials: "PI" },
  { name: "Dr. Vivek Rao", role: "Sports Physio", spec: "Athletes · Return-to-play", exp: "11 yrs", initials: "VR" },
  { name: "Dr. Neha Kulkarni", role: "Periodontist", spec: "Gums · Implants", exp: "9 yrs", initials: "NK" },
  { name: "Dr. Arjun Desai", role: "Pediatric Physio", spec: "Children & Developmental", exp: "6 yrs", initials: "AD" },
];

function DoctorsPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">Our team</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Specialists who actually listen.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every doctor at CareConnect is board-certified, vetted and committed to
          our NGO mission — they donate hours each month to subsidized patients.
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((d) => (
            <article key={d.name} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:-translate-y-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-brand font-display text-2xl font-bold text-primary-foreground">
                {d.initials}
              </div>
              <h3 className="mt-5 font-display text-base font-bold">{d.name}</h3>
              <p className="text-xs font-semibold text-primary-strong">{d.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{d.spec}</p>
              <div className="mt-4 flex items-center gap-1 border-t border-border pt-3 text-xs text-muted-foreground">
                <Award className="h-3.5 w-3.5" /> {d.exp} experience
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
