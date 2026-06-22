/**
 * CareConnect AI — API Client
 *
 * Place this file at: src/lib/api.ts
 *
 * This is the ONLY file that talks to the backend.
 * All components call these typed helpers instead of raw fetch().
 */

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Token helpers ─────────────────────────────────────────────────────────────
// export const getToken = (): string | null => localStorage.getItem("cc_token");
// export const setToken = (token: string) => localStorage.setItem("cc_token", token);
// export const removeToken = () => localStorage.removeItem("cc_token");

// export const getUser = () => {
//   const raw = localStorage.getItem("cc_user");
//   return raw ? JSON.parse(raw) : null;
// };
// export const setUser = (user: unknown) =>
//   localStorage.setItem("cc_user", JSON.stringify(user));
// export const removeUser = () => localStorage.removeItem("cc_user");

const isBrowser = typeof window !== "undefined";

export const getToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem("cc_token");
};

export const setToken = (token: string) => {
  if (isBrowser) localStorage.setItem("cc_token", token);
};

export const removeToken = () => {
  if (isBrowser) localStorage.removeItem("cc_token");
};

export const getUser = () => {
  if (!isBrowser) return null;

  const raw = localStorage.getItem("cc_user");
  return raw ? JSON.parse(raw) : null;
};

export const setUser = (user: unknown) => {
  if (isBrowser) {
    localStorage.setItem("cc_user", JSON.stringify(user));
  }
};

export const removeUser = () => {
  if (isBrowser) {
    localStorage.removeItem("cc_user");
  }
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  let json: { success: boolean; message?: string; data?: T };
  try {
    json = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }

  return (json.data ?? json) as T;
}

// ── Type definitions ──────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  is_active: number;
  created_at: string;
}

export interface Doctor {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  specialization: string;
  department: "dental" | "physiotherapy" | "general";
  experience_yrs: number;
  bio?: string;
  available_days: string;
  consultation_fee: number;
  is_active: number;
}

export interface Appointment {
  id: number;
  patient_id: number;
  doctor_id: number;
  appointment_date: string;
  appointment_time: string;
  department: string;
  reason?: string;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  notes?: string;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  specialization: string;
}

export interface Donation {
  id: number;
  donor_name: string;
  donor_email?: string;
  amount: number;
  message?: string;
  status: string;
  donated_at: string;
}

export interface NgoRequest {
  id: number;
  applicant_name: string;
  age: number;
  income: number;
  family_size: number;
  employment_status: string;
  medical_urgency: number;
  disability: string;
  priority_score: number;
  priority_label: "high" | "medium" | "low";
  subsidy_pct: number;
  review_status: "pending" | "approved" | "rejected";
}

export interface NgoScoreResult {
  score: number;
  label: "high" | "medium" | "low";
  subsidy_pct: number;
  factors: { key: string; score: number; raw_value: number; weight_pct: number }[];
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: User }>("/auth/me"),

  updateProfile: (data: Partial<User>) =>
    request<{ user: User }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// ── Doctor API ────────────────────────────────────────────────────────────────
export const doctorApi = {
  list: (department?: string) =>
    request<{ doctors: Doctor[] }>(
      `/doctors${department ? `?department=${department}` : ""}`
    ),

  get: (id: number) => request<{ doctor: Doctor }>(`/doctors/${id}`),

  create: (data: Partial<Doctor> & { createAccount?: boolean; password?: string }) =>
    request<{ doctor: Doctor }>("/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Doctor>) =>
    request<{ doctor: Doctor }>(`/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request(`/doctors/${id}`, { method: "DELETE" }),

  myAppointments: () =>
    request<{ appointments: Appointment[] }>("/doctors/me/appointments"),
};

// ── Appointment API ───────────────────────────────────────────────────────────
export const appointmentApi = {
  list: (params?: { status?: string; date?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][]
    ).toString();
    return request<{ appointments: Appointment[] }>(
      `/appointments${qs ? `?${qs}` : ""}`
    );
  },

  get: (id: number) =>
    request<{ appointment: Appointment }>(`/appointments/${id}`),

  book: (data: {
    doctor_id: number;
    appointment_date: string;
    appointment_time: string;
    department?: string;
    reason?: string;
  }) =>
    request<{ appointment: Appointment }>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Appointment>) =>
    request<{ appointment: Appointment }>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  cancel: (id: number) =>
    request<{ appointment: Appointment }>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "cancelled" }),
    }),

  delete: (id: number) =>
    request(`/appointments/${id}`, { method: "DELETE" }),

  stats: () => request("/appointments/stats"),
};

// ── Donation API ──────────────────────────────────────────────────────────────
export const donationApi = {
  list: () => request<{ donations: Donation[]; totals: { total: number; count: number } }>("/donations"),

  total: () => request<{ total: number; count: number }>("/donations/total"),

  donate: (data: {
    donor_name: string;
    donor_email?: string;
    amount: number;
    message?: string;
  }) =>
    request<{ donation: Donation }>("/donations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ── NGO API ───────────────────────────────────────────────────────────────────
export const ngoApi = {
  /** Score only — does NOT save to DB (mirrors the live frontend tool) */
  predict: (data: {
    income: number;
    family_size: number;
    employment_status: string;
    medical_urgency: number;
    age: number;
    disability?: string;
  }) =>
    request<NgoScoreResult>("/ngo/predict", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Score + persist application */
  apply: (data: {
    applicant_name: string;
    applicant_email?: string;
    applicant_phone?: string;
    age: number;
    gender?: string;
    income: number;
    family_size: number;
    employment_status: string;
    medical_urgency: number;
    disability?: string;
    medical_condition?: string;
  }) =>
    request<{ request: NgoRequest; scoring: NgoScoreResult }>("/ngo/apply", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Admin: list all applications */
  listRequests: (params?: { review_status?: string; priority_label?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][]
    ).toString();
    return request<{ requests: NgoRequest[]; stats: object }>(
      `/ngo/requests${qs ? `?${qs}` : ""}`
    );
  },

  /** Admin: review an application */
  review: (id: number, review_status: string, reviewer_notes?: string) =>
    request<{ request: NgoRequest }>(`/ngo/requests/${id}/review`, {
      method: "PUT",
      body: JSON.stringify({ review_status, reviewer_notes }),
    }),
};

// ── Convenience: logout ───────────────────────────────────────────────────────
export function logout() {
  removeToken();
  removeUser();
}