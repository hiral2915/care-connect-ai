import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { notifyAppointmentEvent } from "@/lib/appointments.functions";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Calendar, Clock, CheckCircle2, XCircle, User, Loader2 } from "lucide-react";

export const Route = createFileRoute("/doctor")({
  component: DoctorDashboard,
});

type Row = {
  id: string;
  service: "dental" | "physio";
  preferred_date: string;
  slot_time: string;
  reason: string | null;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  created_at: string;
  patient: { full_name: string | null; email: string | null; phone: string | null } | null;
};

function DoctorDashboard() {
  const { isLoading, isAuthenticated, hasRole, profile } = useAuth();
  const navigate = useNavigate();
  const triggerNotify = useServerFn(notifyAppointmentEvent);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/doctor" } });
      return;
    }
    if (!hasRole("doctor") && !hasRole("admin")) {
      notifyError("Access denied", "Only doctors can view this page.");
      navigate({ to: "/dashboard" });
      return;
    }
    load();
  }, [isLoading, isAuthenticated, hasRole, navigate]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "id, service, preferred_date, slot_time, reason, status, created_at, patient:profiles!appointments_patient_id_fkey(full_name, email, phone)",
      )
      .order("preferred_date", { ascending: true });
    if (error) notifyError("Could not load", error.message);
    setRows((data as unknown as Row[]) ?? []);
    setLoading(false);
  }

  async function decide(id: string, status: "accepted" | "rejected") {
    setActing(id);
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    setActing(null);
    if (error) return notifyError("Update failed", error.message);
    triggerNotify({ data: { appointment_id: id, event: status } }).catch(() => undefined);
    notifySuccess(status === "accepted" ? "Appointment accepted" : "Appointment rejected");
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  }

  const pending = rows.filter((r) => r.status === "pending");
  const upcoming = rows.filter((r) => r.status === "accepted");
  const history = rows.filter((r) => !["pending", "accepted"].includes(r.status));

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Doctor Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome, Dr. {profile?.full_name ?? ""}
        </p>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading appointments…
          </div>
        ) : (
          <>
            <Section title={`Pending requests (${pending.length})`}>
              {pending.length === 0 ? (
                <Empty text="No pending requests." />
              ) : (
                pending.map((r) => (
                  <ApptCard key={r.id} row={r}>
                    <button
                      disabled={acting === r.id}
                      onClick={() => decide(r.id, "accepted")}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                    </button>
                    <button
                      disabled={acting === r.id}
                      onClick={() => decide(r.id, "rejected")}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </ApptCard>
                ))
              )}
            </Section>

            <Section title={`Upcoming (${upcoming.length})`}>
              {upcoming.length === 0 ? <Empty text="No accepted appointments." /> : upcoming.map((r) => <ApptCard key={r.id} row={r} />)}
            </Section>

            <Section title={`History (${history.length})`}>
              {history.length === 0 ? <Empty text="Nothing yet." /> : history.map((r) => <ApptCard key={r.id} row={r} />)}
            </Section>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-3 font-display text-xl font-bold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function ApptCard({ row, children }: { row: Row; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary-strong">
          <User className="h-4 w-4" />
        </span>
        <div>
          <p className="font-semibold">{row.patient?.full_name ?? "Patient"}</p>
          <p className="text-xs text-muted-foreground">
            {row.patient?.email ?? ""} {row.patient?.phone ? `· ${row.patient.phone}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(row.preferred_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {row.slot_time}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{row.service}</span>
          </div>
          {row.reason && (
            <p className="mt-1.5 text-xs text-muted-foreground">Reason: {row.reason}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
