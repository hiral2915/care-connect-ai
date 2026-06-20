import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Target, Heart, Lightbulb, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CareConnect AI" },
      { name: "description", content: "Our mission: world-class dental & physio care for everyone, funded fairly through AI-driven NGO support." },
      { property: "og:title", content: "About CareConnect AI" },
      { property: "og:description", content: "Our mission, values and impact." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-strong">About us</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          We started CareConnect because healthcare shouldn't depend on income.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
          What began as a single-chair dental practice in 2018 is now a two-specialty
          clinic with a parallel NGO program. We treat paying patients to fund the
          care of patients who can't pay — and we use AI to make sure the help
          reaches the right people.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {[
            { icon: Target, title: "Mission", body: "Make modern dental & physio care universally accessible." },
            { icon: Heart, title: "Values", body: "Empathy first. Evidence-based. Transparent always." },
            { icon: Lightbulb, title: "Why AI", body: "Fair triage at scale — no favoritism, no guesswork." },
            { icon: Users, title: "Our Team", body: "12 doctors, 4 NGO coordinators, hundreds of volunteers." },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
