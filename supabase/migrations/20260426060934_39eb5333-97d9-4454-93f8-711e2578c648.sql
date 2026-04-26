
-- Role enum
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'volunteer_driver', 'admin');

-- Helper for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','es')),
  role public.app_role NOT NULL DEFAULT 'patient',
  date_of_birth DATE,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer for role checks (separate user_roles is best practice; here role lives on profile per spec, but expose a helper that doesn't recurse)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role);
$$;

-- Profiles policies
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctors view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'doctor'));
CREATE POLICY "Drivers view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'volunteer_driver'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'patient'),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Patients (extends profile for patient-specific data)
CREATE TABLE public.patients (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  conditions TEXT[] NOT NULL DEFAULT '{}',
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  allergies TEXT[] NOT NULL DEFAULT '{}',
  assigned_doctor_id UUID REFERENCES public.profiles(id),
  emergency_contact TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient sees own record" ON public.patients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Doctor sees assigned patients" ON public.patients FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor') AND assigned_doctor_id = auth.uid());
CREATE POLICY "Patient updates own record" ON public.patients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Patient inserts own record" ON public.patients FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Doctor updates assigned patients" ON public.patients FOR UPDATE
  USING (public.has_role(auth.uid(), 'doctor') AND assigned_doctor_id = auth.uid());

CREATE TRIGGER patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'in_person' CHECK (appointment_type IN ('telehealth','in_person')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','completed','cancelled')),
  notes TEXT,
  ai_brief TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient sees own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctor sees own appointments" ON public.appointments FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctor updates own appointments" ON public.appointments FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctor inserts appointments" ON public.appointments FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor') AND auth.uid() = doctor_id);

CREATE TRIGGER appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Health timeline
CREATE TABLE public.health_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('sms_checkin','ai_advice','doctor_note','appointment','ride_request','medication')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient sees own timeline" ON public.health_timeline FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Doctor sees assigned patient timeline" ON public.health_timeline FOR SELECT
  USING (public.has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.assigned_doctor_id = auth.uid()
  ));
CREATE POLICY "Patient inserts own timeline" ON public.health_timeline FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctor inserts timeline for patients" ON public.health_timeline FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'doctor') AND EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.assigned_doctor_id = auth.uid()
  ));

CREATE INDEX idx_timeline_patient_created ON public.health_timeline(patient_id, created_at DESC);

-- Ride requests
CREATE TABLE public.ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  matched_driver_id UUID REFERENCES public.profiles(id),
  pickup_address TEXT NOT NULL,
  destination TEXT NOT NULL,
  requested_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','matched','completed','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ride_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient sees own rides" ON public.ride_requests FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Drivers see open rides" ON public.ride_requests FOR SELECT
  USING (public.has_role(auth.uid(), 'volunteer_driver') AND (status = 'open' OR matched_driver_id = auth.uid()));
CREATE POLICY "Patient creates rides" ON public.ride_requests FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Driver accepts/updates rides" ON public.ride_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'volunteer_driver') AND (status = 'open' OR matched_driver_id = auth.uid()));
CREATE POLICY "Patient updates own rides" ON public.ride_requests FOR UPDATE USING (auth.uid() = patient_id);

CREATE TRIGGER ride_requests_updated_at BEFORE UPDATE ON public.ride_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Volunteer credits
CREATE TABLE public.volunteer_credits (
  driver_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 0,
  total_rides_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.volunteer_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated views leaderboard" ON public.volunteer_credits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Driver updates own credits" ON public.volunteer_credits FOR UPDATE USING (auth.uid() = driver_id);
CREATE POLICY "Driver inserts own credits" ON public.volunteer_credits FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE TRIGGER volunteer_credits_updated_at BEFORE UPDATE ON public.volunteer_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
