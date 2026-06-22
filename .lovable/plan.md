
# Plan: Auth, Dashboards & Email Notifications

This adds real backend functionality, so I'll enable **Lovable Cloud** (managed Postgres + Auth + Email) — replacing the mock-data setup with a real database. You can still describe it as "Node + Postgres + JWT" in your MCA report.

## 1. Backend (Lovable Cloud)

**Auth**: Email/password signup + login. Three roles: `admin`, `doctor`, `patient` (stored in a separate `user_roles` table — never on profiles, to prevent privilege escalation).

**Database tables**:
- `profiles` — id, full_name, phone, email (auto-created on signup, default role = patient)
- `user_roles` — user_id, role (enum: admin/doctor/patient)
- `doctors` — id, profile_id, specialty (dental/physio), bio, qualifications
- `appointments` — id, patient_id, doctor_id, service (dental/physio), preferred_date, slot_time, reason, status (pending/accepted/rejected/completed), created_at, doctor_notes

**RLS policies**:
- Patients: see only their own appointments
- Doctors: see appointments assigned to them; can update status
- Admins: full access via `has_role()` security-definer function

## 2. Booking Flow Fix

Replace `/contact` links on Home, Dental, Physio "Book Appointment" CTAs → `/book-appointment` (already exists as a route). Upgrade `book-appointment.tsx` into a real form that:
- Requires login (redirects to `/login?redirect=/book-appointment` if not)
- Lets patient choose service (dental/physio), doctor (filtered by specialty), date, time slot, reason
- Inserts into `appointments` table with status=`pending`
- Triggers email to the assigned doctor

## 3. Dashboards (role-gated under `/_authenticated`)

**Patient `/dashboard`** — Upcoming + past appointments, status badges, cancel pending, book new.

**Doctor `/doctor`** — Pending requests with Accept/Reject buttons, today's accepted appointments, history. Status change triggers patient email.

**Admin `/admin`** — KPIs (total users, doctors, appointments by status), manage doctors (promote user → doctor, assign specialty), all appointments table, NGO requests overview.

Single `/dashboard` entry redirects based on role.

## 4. Email Notifications (Lovable Emails)

Templates in `src/lib/email-templates/`:
- `appointment-requested-patient` — "We received your request"
- `appointment-requested-doctor` — "New appointment booked for you"
- `appointment-accepted-patient` — "Your appointment is confirmed"
- `appointment-rejected-patient` — "Unable to confirm, please rebook"

Sends triggered via server functions on insert/status-update. Idempotency keys per appointment+event to prevent duplicates. App emails only (no marketing).

## 5. Navbar

Show Login/Sign up when logged out. When logged in, show avatar dropdown → Dashboard / Logout. Hide based on role appropriately.

## Technical Notes

- TanStack Start server functions (`*.functions.ts`) for all DB writes/reads
- `requireSupabaseAuth` middleware + `has_role()` RPC for role checks
- `_authenticated/route.tsx` gate (integration-managed) for protected routes
- Email domain setup required → I'll prompt for it after Cloud is enabled
- Existing public pages (Home, Dental, Physio, NGO, AI Prioritization, Donate, Doctors, Contact) stay unchanged except for button link fix

## Out of Scope (say if you want these too)

- SMS notifications
- Payment for appointments
- Doctor calendar availability with time-slot conflict prevention (will use simple slot strings for now)
- Real video consultation
