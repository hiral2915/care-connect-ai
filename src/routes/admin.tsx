import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { notifyError, notifySuccess } from "@/lib/notify";
import { Loader2, Users, Stethoscope, Calendar, ShieldCheck, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};
type RoleRow = { user_id: string; role: "admin" | "doctor" | "patient" };
type DoctorRow = {
  id: string;
  profile_id: string;
  specialty: "dental" | "physio";
  qualifications: string | null;
  years_experience: number | null;
  is_active: boolean;
};
type ApptRow = {
  id: string;
  service: "dental" | "physio";
  preferred_date: string;
  slot_time: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  patient: { full_name: string | null } | null;
  doctor: { profile: { full_name: string | null } | null } | null;
};

function AdminDashboard() {
  const { isLoading, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "users" | "appointments">("overview");
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [appts, setAppts] = useState<ApptRow[]>([]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/admin" } });
      return;
    }
    if (!hasRole("admin")) {
      notifyError("Access denied", "Admin only.");
      navigate({ to: "/dashboard" });
      return;
    }
    refresh();
  }, [isLoading, isAuthenticated, hasRole, navigate]);

  async function refresh() {
    setLoading(true);
    const [p, r, d, a] = await Promise.all([
      supabase.from("profiles").select("id, full_name, email, phone").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("doctors").select("id, profile_id, specialty, qualifications, years_experience, is_active"),
      supabase
        .from("appointments")
        .select(
          "id, service, preferred_date, slot_time, status, patient:profiles!appointments_patient_id_fkey(full_name), doctor:doctors!appointments_doctor_id_fkey(profile:profiles!doctors_profile_id_fkey(full_name))",
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    setProfiles((p.data as ProfileRow[]) ?? []);
    setRoles((r.data as RoleRow[]) ?? []);
    setDoctors((d.data as DoctorRow[]) ?? []);
    setAppts((a.data as unknown as ApptRow[]) ?? []);
    setLoading(false);
  }

  const totalUsers = profiles.length;
  const totalDoctors = doctors.length;
  const apptsByStatus = appts.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  async function promoteToDoctor(profile: ProfileRow, specialty: "dental" | "physio") {
    // 1) ensure doctor role
    const { error: roleErr } = await supabase
      .from("user_roles")
      .upsert({ user_id: profile.id, role: "doctor" }, { onConflict: "user_id,role" });
    if (roleErr) return notifyError("Could not assign role", roleErr.message);
    // 2) insert doctor row
    const { error: docErr } = await supabase.from("doctors").upsert(
      { profile_id: profile.id, specialty, is_active: true },
      { onConflict: "profile_id" },
    );
    if (docErr) return notifyError("Could not create doctor", docErr.message);
    notifySuccess(`Promoted ${profile.full_name ?? profile.email} to ${specialty} doctor`);
    refresh();
  }

  async function promoteToAdmin(profile: ProfileRow) {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: profile.id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) return notifyError("Failed", error.message);
    notifySuccess("Admin role granted");
    refresh();
  }

  function rolesFor(uid: string) {
    return roles.filter((r) => r.user_id === uid).map((r) => r.role);
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-strong" />
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1 text-sm font-medium w-fit">
          {(["overview", "users", "appointments"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 capitalize ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : tab === "overview" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Users} label="Total users" value={totalUsers} />
            <Kpi icon={Stethoscope} label="Doctors" value={totalDoctors} />
            <Kpi icon={Calendar} label="Pending appts" value={apptsByStatus.pending ?? 0} />
            <Kpi icon={Calendar} label="Accepted appts" value={apptsByStatus.accepted ?? 0} />
            <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-3 font-display font-bold">Appointments by status</h3>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {(["pending", "accepted", "rejected", "completed", "cancelled"] as const).map((s) => (
                  <div key={s} className="rounded-lg bg-muted p-3 text-center">
                    <div className="font-bold text-lg">{apptsByStatus[s] ?? 0}</div>
                    <div className="capitalize text-muted-foreground">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : tab === "users" ? (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Roles</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const rs = rolesFor(p.id);
                  const isDoctor = rs.includes("doctor");
                  const isAdmin = rs.includes("admin");
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{p.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {rs.map((r) => (
                            <span key={r} className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold capitalize text-primary-strong">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-1">
                          {!isDoctor && (
                            <>
                              <button
                                onClick={() => promoteToDoctor(p, "dental")}
                                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                              >
                                <UserPlus className="h-3 w-3" /> Make dental doctor
                              </button>
                              <button
                                onClick={() => promoteToDoctor(p, "physio")}
                                className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                              >
                                <UserPlus className="h-3 w-3" /> Make physio doctor
                              </button>
                            </>
                          )}
                          {!isAdmin && (
                            <button
                              onClick={() => promoteToAdmin(p)}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
                            >
                              <ShieldCheck className="h-3 w-3" /> Make admin
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Doctor</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">{a.preferred_date}</td>
                    <td className="px-4 py-3">{a.slot_time}</td>
                    <td className="px-4 py-3 capitalize">{a.service}</td>
                    <td className="px-4 py-3">{a.patient?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">{a.doctor?.profile?.full_name ?? "—"}</td>
                    <td className="px-4 py-3 capitalize">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-primary-strong" />
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
