/**
 * Server functions for appointment notifications.
 *
 * Each function looks up the appointment + the patient/doctor profiles and
 * attempts to send an email via the Lovable Emails endpoint when an email
 * domain has been configured. If the email infrastructure is not yet set up,
 * it logs the event server-side and returns { ok: true, skipped: true } so the
 * client flow is never blocked.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const inputSchema = z.object({
  appointment_id: z.string().uuid(),
  event: z.enum(["requested", "accepted", "rejected"]),
});

type EmailRecipient = { email: string; name: string };

async function sendEmail(opts: {
  to: EmailRecipient;
  subject: string;
  html: string;
  idempotencyKey: string;
  bearer: string;
}) {
  // Try the Lovable Emails transactional send endpoint. If email infra is not
  // configured this endpoint won't exist (404) and we silently skip.
  try {
    const url =
      (process.env.SITE_URL ?? process.env.LOVABLE_SITE_URL ?? "") +
      "/lovable/email/transactional/send";
    if (!url.startsWith("http")) return { skipped: true };
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${opts.bearer}`,
      },
      body: JSON.stringify({
        recipientEmail: opts.to.email,
        templateName: "raw-html",
        idempotencyKey: opts.idempotencyKey,
        subject: opts.subject,
        templateData: { html: opts.html, name: opts.to.name },
      }),
    });
    if (!res.ok) {
      console.log("[email] skipped", res.status, await res.text());
      return { skipped: true };
    }
    return { sent: true };
  } catch (err) {
    console.log("[email] error", err);
    return { skipped: true };
  }
}

export const notifyAppointmentEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const bearer =
      (context.claims as { token?: string }).token ??
      process.env.SUPABASE_PUBLISHABLE_KEY ??
      "";

    const { data: appt, error } = await supabase
      .from("appointments")
      .select(
        "id, patient_id, doctor_id, service, preferred_date, slot_time, reason, status",
      )
      .eq("id", data.appointment_id)
      .maybeSingle();

    if (error || !appt) {
      return { ok: false, error: error?.message ?? "Not found" };
    }

    // Look up patient + doctor email/names via the privileged client (we only
    // need email + name to send notifications; not exposed to clients).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: patient }, { data: doctorRow }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("full_name, email")
        .eq("id", appt.patient_id)
        .maybeSingle(),
      supabaseAdmin
        .from("doctors")
        .select("id, profile:profiles!doctors_profile_id_fkey(full_name, email)")
        .eq("id", appt.doctor_id)
        .maybeSingle(),
    ]);

    const doctor = (doctorRow as unknown as {
      profile: { full_name: string | null; email: string | null } | null;
    } | null)?.profile;

    const dateLine = `${appt.preferred_date} at ${appt.slot_time} (${appt.service})`;

    if (data.event === "requested") {
      const results = [];
      if (patient?.email) {
        results.push(
          await sendEmail({
            to: { email: patient.email, name: patient.full_name ?? "" },
            subject: "We received your appointment request",
            html: `<p>Hi ${patient.full_name ?? ""},</p><p>We received your request for <b>${dateLine}</b>. The doctor will confirm shortly.</p>`,
            idempotencyKey: `${appt.id}-patient-requested`,
            bearer,
          }),
        );
      }
      if (doctor?.email) {
        results.push(
          await sendEmail({
            to: { email: doctor.email, name: doctor.full_name ?? "" },
            subject: "New appointment booked",
            html: `<p>Dr. ${doctor.full_name ?? ""},</p><p>${patient?.full_name ?? "A patient"} booked an appointment for <b>${dateLine}</b>.</p><p>Reason: ${appt.reason ?? "—"}</p>`,
            idempotencyKey: `${appt.id}-doctor-requested`,
            bearer,
          }),
        );
      }
      return { ok: true, results };
    }

    if (data.event === "accepted" || data.event === "rejected") {
      if (!patient?.email) return { ok: true, skipped: true };
      const subject =
        data.event === "accepted"
          ? "Your appointment is confirmed"
          : "Appointment update from CareConnect";
      const body =
        data.event === "accepted"
          ? `<p>Your appointment with Dr. ${doctor?.full_name ?? ""} for <b>${dateLine}</b> is confirmed. See you then!</p>`
          : `<p>Unfortunately Dr. ${doctor?.full_name ?? ""} could not accept your request for <b>${dateLine}</b>. Please try another time slot.</p>`;
      const result = await sendEmail({
        to: { email: patient.email, name: patient.full_name ?? "" },
        subject,
        html: `<p>Hi ${patient.full_name ?? ""},</p>${body}`,
        idempotencyKey: `${appt.id}-patient-${data.event}`,
        bearer,
      });
      return { ok: true, result };
    }

    return { ok: true };
  });
