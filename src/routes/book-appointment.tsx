/**
 * CareConnect AI — Book Appointment
 * Authenticated patients can book an appointment with a doctor.
 */
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { notifyAppointmentEvent } from "@/lib/appointments.functions";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Calendar, Clock, User, Stethoscope, Loader2 } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  service: z.enum(["dental", "physio"]).optional(),
});

export const Route = createFileRoute("/book-appointment")({
  validateSearch: (s) => searchSchema.parse(s),
  component: BookAppointmentPage,
});

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

type DoctorRow = {
  id: string;
  specialty: "dental" | "physio";
  qualifications: string | null;
  years_experience: number | null;
  profile: { full_name: string | null } | null;
};

function BookAppointmentPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/book-appointment" });
  const triggerNotify = useServerFn(notifyAppointmentEvent);

  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [form, setForm] = useState({
    service: search.service ?? ("dental" as "dental" | "physio"),
    doctor_id: "",
    preferred_date: "",
    slot_time: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/book-appointment" } });
      return;
    }
    supabase
      .from("doctors")
      .select("id, specialty, qualifications, years_experience, profile:profiles!doctors_profile_id_fkey(full_name)")
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (error) notifyError("Could not load doctors", error.message);
        setDoctors((data as unknown as DoctorRow[]) ?? []);
        setFetchingDoctors(false);
      });
  }, [authLoading, isAuthenticated, navigate]);

  const filteredDoctors = doctors.filter((d) => d.specialty === form.service);
  const minDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          patient_id: user.id,
          doctor_id: form.doctor_id,
          service: form.service,
          preferred_date: form.preferred_date,
          slot_time: form.slot_time,
          reason: form.reason || null,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      // Fire notification (non-blocking; failure shouldn't break booking)
      triggerNotify({ data: { appointment_id: data.id, event: "requested" } }).catch(
        () => undefined,
      );
      notifySuccess("Appointment requested", "The doctor will confirm shortly.");
      setSuccess(true);
    } catch (err) {
      notifyError("Booking failed", err instanceof Error ? err.message : "Try again");
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
            Your request has been submitted. You'll be notified once the doctor responds.
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
          Choose service, doctor, date & time. We'll confirm within a few hours.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" /> Service
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["dental", "physio"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, service: s, doctor_id: "" }))}
                  className={`rounded-xl border py-3 text-sm font-semibold capitalize transition ${
                    form.service === s
                      ? "border-primary bg-primary-soft text-primary-strong"
                      : "border-border bg-background"
                  }`}
                >
                  {s === "dental" ? "Dental" : "Physiotherapy"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Doctor
            </label>
            <select
              required
              value={form.doctor_id}
              onChange={(e) => setForm((f) => ({ ...f, doctor_id: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            >
              <option value="">
                {fetchingDoctors
                  ? "Loading doctors…"
                  : filteredDoctors.length === 0
                  ? `No ${form.service} doctors yet — please choose the other service`
                  : "Choose a doctor"}
              </option>
              {filteredDoctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.profile?.full_name ?? "Doctor"} — {d.qualifications ?? d.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Preferred Date
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={form.preferred_date}
              onChange={(e) => setForm((f) => ({ ...f, preferred_date: e.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Preferred Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, slot_time: t }))}
                  className={`rounded-xl border py-2 text-sm font-medium transition ${
                    form.slot_time === t
                      ? "border-primary bg-primary-soft text-primary-strong"
                      : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reason / Symptoms (optional)
            </label>
            <textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
              placeholder="Brief description of your issue…"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !form.doctor_id || !form.preferred_date || !form.slot_time}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl gradient-brand py-3 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Booking…" : "Book Appointment"}
          </button>
        </form>
      </div>
    </SiteLayout>
  );
}
