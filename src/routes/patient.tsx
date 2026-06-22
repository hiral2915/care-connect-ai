import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { notifyError, notifySuccess } from "@/lib/notify";
import {
  Calendar, Clock, User, CheckCircle2, XCircle, AlertCircle, Plus, Stethoscope,
} from "lucide-react";

export const Route = createFileRoute("/patient")({
  component: PatientDashboard,
});

type Row = {
  id: string;
  service: "dental" | "physio";
  preferred_date: string;
  slot_time: string;
  reason: string | null;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  doctor_notes: string | null;
  created_at: string;
  doctor: { profile: { full_name: string | null } | null } | null;
};

const statusStyle: Record<Row["status"], string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted:  "bg-green-100 text-green-800 border-green-200",
  rejected:  "bg-red-100 text-red-800 border-red-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};
const statusIcon: Record<Row["status"], React.ElementType> = {
  pending: AlertCircle,
  accepted: CheckCircle2,
  rejected: XCircle,
  completed: CheckCircle2,
  cancelled: XCircle,
};

function PatientDashboard() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/patient" } });
      return;
    }
    supabase
      .from("appointments")
      .select(
        "id, service, preferred_date, slot_time, reason, status, doctor_notes, created_at, doctor:doctors!appointments_doctor_id_fkey(profile:profiles!doctors_profile_id_fkey(full_name))",
      )
      .order("preferred_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) notifyError("Could not load appointments", error.message);
        setAppts((data as unknown as Row[]) ?? []);
        setLoading(false);
      });
  }, [isLoading, isAuthenticated, navigate, user]);

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) return notifyError("Cancel failed", error.message);
    setAppts((rows) => rows.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)));
    notifySuccess("Appointment cancelled");
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">My Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back,{" "}
              <span className="font-semibold text-foreground">
                {profile?.full_name ?? user?.email}
              </span>
            </p>
          </div>
          <Link
            to="/book-appointment"
            className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Book appointment
          </Link>
        </div>

        <h2 className="mb-4 font-display text-xl font-bold">Appointments</h2>

        {loading && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading…
          </div>
        )}

        {!loading && appts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No appointments yet</p>
            <Link
              to="/book-appointment"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Book now
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {appts.map((a) => {
            const Icon = statusIcon[a.status];
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold">
                        Dr. {a.doctor?.profile?.full_name ?? "—"}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">
                        <Stethoscope className="mr-1 inline h-3 w-3" />
                        {a.service === "dental" ? "Dental" : "Physiotherapy"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(a.preferred_date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {a.slot_time}
                        </span>
                      </div>
                      {a.reason && (
                        <p className="mt-1.5 text-xs text-muted-foreground">Reason: {a.reason}</p>
                      )}
                      {a.doctor_notes && (
                        <p className="mt-1.5 rounded-lg bg-muted px-3 py-2 text-xs">
                          <span className="font-semibold">Doctor's note:</span> {a.doctor_notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle[a.status]}`}
                    >
                      <Icon className="h-3 w-3" />
                      {a.status}
                    </span>
                    {a.status === "pending" && (
                      <button
                        onClick={() => cancel(a.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SiteLayout>
  );
}
