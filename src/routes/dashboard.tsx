/**
 * CareConnect AI — Patient Dashboard
 *
 * Place this file at: src/routes/dashboard.tsx
 * Route: /dashboard
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { appointmentApi, type Appointment } from "@/lib/api";
import {
  Calendar, Clock, User, CheckCircle2, XCircle,
  AlertCircle, LogOut, Plus,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const statusColor: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved:  "bg-green-100  text-green-800  border-green-200",
  completed: "bg-blue-100   text-blue-800   border-blue-200",
  cancelled: "bg-gray-100   text-gray-600   border-gray-200",
  rejected:  "bg-red-100    text-red-800    border-red-200",
};

const statusIcon: Record<string, React.ElementType> = {
  pending:   AlertCircle,
  approved:  CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
  rejected:  XCircle,
};

function DashboardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
      return;
    }
    appointmentApi
      .list()
      .then(({ appointments: a }) => setAppointments(a))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  async function handleCancel(id: number) {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await appointmentApi.cancel(id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Could not cancel");
    }
  }

  if (!user) return null;

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">My Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user.name}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/book-appointment"
              className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Book Appointment
            </Link>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand font-display text-xl font-bold text-primary-foreground">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold capitalize text-primary-strong">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <h2 className="mb-4 font-display text-xl font-bold">My Appointments</h2>

        {loading && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Loading appointments…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No appointments yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Book your first appointment and it will appear here.
            </p>
            <Link
              to="/book-appointment"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Book now
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {appointments.map((appt) => {
            const Icon = statusIcon[appt.status] ?? AlertCircle;
            return (
              <div
                key={appt.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-strong">
                      <User className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold">{appt.doctor_name}</p>
                      <p className="text-xs text-muted-foreground">{appt.specialization}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(appt.appointment_date).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appt.appointment_time}
                        </span>
                      </div>
                      {appt.reason && (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Reason: {appt.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusColor[appt.status] ?? ""}`}
                    >
                      <Icon className="h-3 w-3" />
                      {appt.status}
                    </span>
                    {appt.status === "pending" && (
                      <button
                        onClick={() => handleCancel(appt.id)}
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