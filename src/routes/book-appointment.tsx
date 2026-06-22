/**
 * CareConnect AI — Book Appointment Page
 *
 * Place this file at: src/routes/book-appointment.tsx
 * Route: /book-appointment
 */

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { doctorApi, appointmentApi, type Doctor } from "@/lib/api";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/book-appointment")({
  component: BookAppointmentPage,
});

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

function BookAppointmentPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [form, setForm] = useState({
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    department: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate({ to: "/login" }); return; }
    doctorApi
      .list()
      .then(({ doctors: d }) => setDoctors(d))
      .catch((e) => setError(e.message))
      .finally(() => setFetchingDoctors(false));
  }, [isAuthenticated, navigate]);

  const selectedDoctor = doctors.find((d) => d.id === +form.doctor_id);
  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await appointmentApi.book({
        doctor_id: +form.doctor_id,
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        department: form.department || selectedDoctor?.department,
        reason: form.reason,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <SiteLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-green-100 text-green-600">
            <Calendar className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-bold">Appointment Booked!</h2>
          <p className="mt-2 max-w-sm text-muted-foreground">
            Your appointment request has been submitted. Our team will confirm shortly.
          </p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="mt-6 rounded-xl gradient-brand px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            View my appointments
          </button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Book an Appointment</h1>
        <p className="mt-2 text-muted-foreground">
          Choose your doctor, date and time. We'll confirm within a few hours.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Doctor select */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Select Doctor
            </label>
            <select
              required
              value={form.doctor_id}
              onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/40 focus:border-primary focus:ring-2"
            >
              <option value="">
                {fetchingDoctors ? "Loading doctors…" : "Choose a doctor"}
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialization} ({d.department})
                </option>
              ))}
            </select>
          </div>

          {/* Department (auto-filled) */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" /> Department
            </label>
            <input
              readOnly
              value={
                selectedDoctor
                  ? selectedDoctor.department.charAt(0).toUpperCase() +
                    selectedDoctor.department.slice(1)
                  : "Auto-filled from doctor"
              }
              className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground"
            />
          </div>

          {/* Date */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Preferred Date
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={form.appointment_date}
              onChange={(e) => setForm((f) => ({ ...f, appointment_date: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/40 focus:border-primary focus:ring-2"
            />
          </div>

          {/* Time slots */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Preferred Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, appointment_time: t }))}
                  className={`rounded-xl border py-2 text-sm font-medium transition ${
                    form.appointment_time === t
                      ? "border-primary bg-primary-soft text-primary-strong"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.appointment_time && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Selected: {form.appointment_time}
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reason / Symptoms (optional)
            </label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Brief description of your issue…"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-primary/40 focus:border-primary focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.doctor_id || !form.appointment_date || !form.appointment_time}
            className="w-full rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Booking…" : "Book Appointment"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}