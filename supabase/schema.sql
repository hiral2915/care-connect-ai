-- ============================================================
-- CareConnect AI — Complete schema for a fresh Supabase project
-- ------------------------------------------------------------
-- Run this once in the Supabase SQL editor on YOUR project.
-- Creates: enums, tables (profiles, user_roles, doctors,
-- appointments), RLS policies, has_role() helper, signup trigger.
-- ============================================================

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'patient');
CREATE TYPE public.appointment_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
CREATE TYPE public.service_type AS ENUM ('dental', 'physio');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security-definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Doctors
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty public.service_type NOT NULL,
  qualifications TEXT,
  bio TEXT,
  years_experience INT DEFAULT 0,
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  service public.service_type NOT NULL,
  preferred_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  reason TEXT,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + patient role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Lock down helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- ===== RLS Policies =====

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'doctor'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- doctors
CREATE POLICY "Anyone views doctors" ON public.doctors
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage doctors" ON public.doctors
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctors update own row" ON public.doctors
  FOR UPDATE TO authenticated USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- appointments
CREATE POLICY "Patients view own appointments" ON public.appointments
  FOR SELECT TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Patients create own appointments" ON public.appointments
  FOR INSERT TO authenticated WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Patients cancel own pending" ON public.appointments
  FOR UPDATE TO authenticated USING (patient_id = auth.uid()) WITH CHECK (patient_id = auth.uid());
CREATE POLICY "Doctors view assigned appointments" ON public.appointments
  FOR SELECT TO authenticated USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
CREATE POLICY "Doctors update assigned appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  ) WITH CHECK (
    doctor_id IN (SELECT id FROM public.doctors WHERE profile_id = auth.uid())
  );
CREATE POLICY "Admins view all appointments" ON public.appointments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage all appointments" ON public.appointments
  FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Indexes
CREATE INDEX idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- ============================================================
-- After running this:
-- 1. Register an account in the app (you'll be assigned 'patient').
-- 2. In SQL editor, promote yourself to admin:
--      INSERT INTO public.user_roles (user_id, role)
--      VALUES ('YOUR-AUTH-USER-UUID', 'admin');
-- 3. Use the admin dashboard to grant doctor roles to others.
-- ============================================================
