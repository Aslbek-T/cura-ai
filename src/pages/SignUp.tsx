import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CuraLogo } from "@/components/CuraLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Eye, EyeOff, Plus, X, UserRound, Stethoscope, Car } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleKey = "patient" | "doctor" | "volunteer_driver";

const CONDITIONS = [
  "Type 2 Diabetes", "Type 1 Diabetes", "Hypertension (High Blood Pressure)",
  "Heart Disease", "Coronary Artery Disease", "Heart Failure",
  "COPD", "Asthma", "Respiratory Illness", "Chronic Kidney Disease",
  "Obesity", "High Cholesterol", "Arthritis", "Depression", "Anxiety", "Other",
];

const ALLERGY_SUGGESTIONS = ["Penicillin", "Sulfa drugs", "Aspirin", "Ibuprofen", "Latex", "Shellfish", "None"];

const SPECIALTIES = ["Family Medicine", "Internal Medicine", "Endocrinology", "Cardiology", "Pulmonology", "General Practice", "Other"];

const VEHICLE_TYPES = ["Sedan", "SUV", "Truck", "Van", "Other"];
const SERVICE_AREAS = ["Ajo", "Sells", "Mammoth", "Superior", "Globe", "Miami", "Safford", "Willcox", "Douglas", "Nogales", "Patagonia", "Sonoita", "Other"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Med { name: string; dosage: string; frequency: string }

function pwStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw || pw.length < 8) return 0;
  let s = 0;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(3, s) as 0 | 1 | 2 | 3;
}

export default function SignUp() {
  const { t, lang } = useLanguage();
  const { session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<RoleKey | "">("");

  // Personal
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prefLang, setPrefLang] = useState<"en" | "es">(lang);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Patient
  const [dob, setDob] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionsSearch, setConditionsSearch] = useState("");
  const [otherConditions, setOtherConditions] = useState("");
  const [meds, setMeds] = useState<Med[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");
  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);
  const [assignedDoc, setAssignedDoc] = useState<string>("");

  // Doctor
  const [license, setLicense] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [clinic, setClinic] = useState("Banner – University Family Care");
  const [yearsExp, setYearsExp] = useState<string>("");
  const [bio, setBio] = useState("");

  // Driver
  const [vehicleType, setVehicleType] = useState("");
  const [wheelchair, setWheelchair] = useState<boolean | null>(null);
  const [serviceArea, setServiceArea] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (role === "patient") {
      supabase.from("profiles").select("id, full_name").eq("role", "doctor").then(({ data }) => {
        setDoctors((data ?? []) as any);
      });
    }
  }, [role]);

  if (!authLoading && session) {
    return <Navigate to="/app" replace />;
  }

  const strength = pwStrength(pw);
  const pwMatch = pw && pw === pw2;
  const phoneValid = /^\+1\d{10}$/.test(phone);

  const personalValid = first.trim() && last.trim() && /^\S+@\S+\.\S+$/.test(email) && phoneValid && pw.length >= 8 && pwMatch;

  const roleValid = useMemo(() => {
    if (role === "patient") return !!dob;
    if (role === "doctor") return !!license.trim() && !!specialty;
    if (role === "volunteer_driver") return !!vehicleType && wheelchair !== null && !!serviceArea && availability.length > 0;
    return false;
  }, [role, dob, license, specialty, vehicleType, wheelchair, serviceArea, availability]);

  const canSubmit = !!role && personalValid && roleValid && !submitting;

  const filteredConditions = useMemo(
    () => CONDITIONS.filter((c) => c.toLowerCase().includes(conditionsSearch.toLowerCase())),
    [conditionsSearch]
  );

  const toggleCondition = (c: string) =>
    setConditions((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  const addAllergy = (val: string) => {
    const v = val.trim();
    if (v && !allergies.includes(v)) setAllergies((p) => [...p, v]);
  };

  const handleAllergyKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAllergy(allergyInput);
      setAllergyInput("");
    }
  };

  const addMed = () => setMeds((p) => [...p, { name: "", dosage: "", frequency: "" }]);
  const updMed = (i: number, patch: Partial<Med>) => setMeds((p) => p.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  const rmMed = (i: number) => setMeds((p) => p.filter((_, idx) => idx !== i));

  const toggleAvailability = (d: string) =>
    setAvailability((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !role) return;
    setSubmitting(true);

    const fullName = `${first.trim()} ${last.trim()}`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: pw,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role,
          preferred_language: prefLang,
        },
      },
    });

    if (error) {
      setSubmitting(false);
      toast.error(error.message);
      return;
    }

    const newId = data.user?.id;
    if (!newId) {
      setSubmitting(false);
      toast.error(lang === "es" ? "No se pudo crear la cuenta" : "Could not create account");
      return;
    }

    // Update profile with phone + dob (if patient)
    await supabase.from("profiles").update({
      phone,
      ...(role === "patient" ? { date_of_birth: dob } : {}),
    }).eq("id", newId);

    // Role-specific inserts
    if (role === "patient") {
      const finalConditions = [
        ...conditions.filter((c) => c !== "Other"),
        ...(conditions.includes("Other") && otherConditions.trim() ? [otherConditions.trim()] : []),
      ];
      await supabase.from("patients").insert({
        id: newId,
        conditions: finalConditions,
        medications: meds.filter((m) => m.name.trim()) as any,
        allergies,
        assigned_doctor_id: assignedDoc || null,
        emergency_contact: emName ? `${emName}${emPhone ? ` ${emPhone}` : ""}` : null,
      });
    } else if (role === "volunteer_driver") {
      await supabase.from("volunteer_credits").insert({
        driver_id: newId,
        credits: 0,
        total_rides_completed: 0,
      });
    }

    setSubmitting(false);
    toast.success(lang === "es" ? "¡Cuenta creada!" : "Account created!");
    // The auth listener will redirect via /app to the role-based dashboard
    navigate("/app");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full gradient-soft blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full gradient-soft blur-3xl opacity-70" />

      <div className="relative z-10 flex items-center justify-between p-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <LanguageToggle />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6">
        <div className="w-full max-w-[480px]">
          <Card className="border-border/60 p-6 shadow-elevated">
            <div className="mb-6 flex flex-col items-center text-center">
              <CuraLogo size="md" />
              <h1 className="mt-4 text-xl font-bold tracking-tight">{t("signup_title")}</h1>
              <p className="mt-1 text-xs text-muted-foreground">{t("signup_subtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: role */}
              <section>
                <p className="mb-3 text-sm font-semibold">{t("signup_iAm")}</p>
                <div className="space-y-2">
                  <RoleCard
                    icon={<UserRound className="h-5 w-5" />}
                    label={t("rolePatient")}
                    desc={t("signup_role_patient_desc")}
                    selected={role === "patient"}
                    onClick={() => setRole("patient")}
                    emoji="🏥"
                  />
                  <RoleCard
                    icon={<Stethoscope className="h-5 w-5" />}
                    label={t("roleDoctor")}
                    desc={t("signup_role_doctor_desc")}
                    selected={role === "doctor"}
                    onClick={() => setRole("doctor")}
                    emoji="👩‍⚕️"
                  />
                  <RoleCard
                    icon={<Car className="h-5 w-5" />}
                    label={t("roleDriver")}
                    desc={t("signup_role_driver_desc")}
                    selected={role === "volunteer_driver"}
                    onClick={() => setRole("volunteer_driver")}
                    emoji="🚗"
                  />
                </div>
              </section>

              {/* Step 2: personal info */}
              {role && (
                <section className="space-y-3">
                  <p className="text-sm font-semibold">{t("signup_personal")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t("signup_first")} *</Label>
                      <Input value={first} onChange={(e) => setFirst(e.target.value)} required />
                    </div>
                    <div>
                      <Label className="text-xs">{t("signup_last")} *</Label>
                      <Input value={last} onChange={(e) => setLast(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t("email")} *</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_phone")} *</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15205550100" required />
                    <p className="mt-1 text-[11px] text-muted-foreground">{t("signup_phoneHint")}</p>
                    {phone && !phoneValid && (
                      <p className="mt-1 text-[11px] text-destructive">{t("signup_phoneHint")}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_lang")}</Label>
                    <div className="mt-1 flex gap-2">
                      <Button type="button" size="sm" variant={prefLang === "en" ? "default" : "outline"} onClick={() => setPrefLang("en")}>English</Button>
                      <Button type="button" size="sm" variant={prefLang === "es" ? "default" : "outline"} onClick={() => setPrefLang("es")}>Español</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t("password")} *</Label>
                    <div className="relative">
                      <Input
                        type={showPw ? "text" : "password"}
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        required
                        minLength={8}
                        className="pr-10"
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {pw && (
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-base",
                              strength > i
                                ? strength === 1 ? "bg-destructive" : strength === 2 ? "bg-warning" : "bg-success"
                                : "bg-secondary"
                            )}
                          />
                        ))}
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {strength === 0 ? t("signup_pwMin") : strength === 1 ? t("signup_pwWeak") : strength === 2 ? t("signup_pwMedium") : t("signup_pwStrong")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_confirmPw")} *</Label>
                    <Input type={showPw ? "text" : "password"} value={pw2} onChange={(e) => setPw2(e.target.value)} required />
                    {pw2 && !pwMatch && (
                      <p className="mt-1 text-[11px] text-destructive">{t("signup_pwMismatch")}</p>
                    )}
                  </div>
                </section>
              )}

              {/* Step 3: role-specific */}
              {role === "patient" && (
                <section className="space-y-4 border-t border-border pt-4">
                  <div>
                    <Label className="text-xs">{t("signup_dob")} *</Label>
                    <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">{t("signup_conditions")}</p>
                    <Input
                      className="mt-2"
                      placeholder={t("signup_conditionsSearch")}
                      value={conditionsSearch}
                      onChange={(e) => setConditionsSearch(e.target.value)}
                    />
                    <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-border p-2">
                      <div className="grid grid-cols-2 gap-1">
                        {filteredConditions.map((c) => {
                          const active = conditions.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleCondition(c)}
                              className={cn(
                                "rounded-md px-2 py-1.5 text-left text-xs transition-base",
                                active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                              )}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {conditions.includes("Other") && (
                      <Input
                        className="mt-2"
                        placeholder={t("signup_otherConditions")}
                        value={otherConditions}
                        onChange={(e) => setOtherConditions(e.target.value)}
                      />
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">{t("signup_meds")}</p>
                    <div className="space-y-2">
                      {meds.map((m, i) => (
                        <div key={i} className="grid grid-cols-[1fr_70px_110px_28px] gap-1.5 items-start">
                          <Input placeholder={t("signup_medName")} value={m.name} onChange={(e) => updMed(i, { name: e.target.value })} className="text-xs" />
                          <Input placeholder="500mg" value={m.dosage} onChange={(e) => updMed(i, { dosage: e.target.value })} className="text-xs" />
                          <Select value={m.frequency} onValueChange={(v) => updMed(i, { frequency: v })}>
                            <SelectTrigger className="text-xs h-9"><SelectValue placeholder={t("signup_medFreq")} /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once daily">{t("signup_freq_once")}</SelectItem>
                              <SelectItem value="twice daily">{t("signup_freq_twice")}</SelectItem>
                              <SelectItem value="three times daily">{t("signup_freq_three")}</SelectItem>
                              <SelectItem value="as needed">{t("signup_freq_asneeded")}</SelectItem>
                              <SelectItem value="weekly">{t("signup_freq_weekly")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" size="icon" variant="ghost" onClick={() => rmMed(i)} className="h-9 w-7"><X className="h-3.5 w-3.5" /></Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="gap-1.5 w-full" onClick={addMed}>
                        <Plus className="h-3.5 w-3.5" /> {t("signup_addMed")} +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">{t("allergies")}</Label>
                    <Input
                      value={allergyInput}
                      onChange={(e) => setAllergyInput(e.target.value)}
                      onKeyDown={handleAllergyKey}
                      placeholder={t("signup_allergiesHint")}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {ALLERGY_SUGGESTIONS.filter((a) => !allergies.includes(a)).map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => addAllergy(a)}
                          className="rounded-full border border-dashed border-border px-2 py-0.5 text-[11px] text-muted-foreground hover:border-primary hover:text-primary transition-base"
                        >
                          + {a}
                        </button>
                      ))}
                    </div>
                    {allergies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {allergies.map((a) => (
                          <Badge key={a} variant="secondary" className="gap-1">
                            {a}
                            <button type="button" onClick={() => setAllergies((p) => p.filter((x) => x !== a))}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t("signup_emergencyName")}</Label>
                      <Input value={emName} onChange={(e) => setEmName(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">{t("signup_emergencyPhone")}</Label>
                      <Input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">{t("signup_assignedDoc")}</Label>
                    <Select value={assignedDoc} onValueChange={setAssignedDoc}>
                      <SelectTrigger><SelectValue placeholder={t("signup_select")} /></SelectTrigger>
                      <SelectContent>
                        {doctors.length === 0 && <div className="p-2 text-xs text-muted-foreground">—</div>}
                        {doctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.full_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-[11px] text-muted-foreground">{t("signup_assignedDocHint")}</p>
                  </div>
                </section>
              )}

              {role === "doctor" && (
                <section className="space-y-3 border-t border-border pt-4">
                  <div>
                    <Label className="text-xs">{t("signup_license")} *</Label>
                    <Input value={license} onChange={(e) => setLicense(e.target.value)} required />
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_specialty")} *</Label>
                    <Select value={specialty} onValueChange={setSpecialty}>
                      <SelectTrigger><SelectValue placeholder={t("signup_select")} /></SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_clinic")}</Label>
                    <Input value={clinic} onChange={(e) => setClinic(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_yearsExp")}</Label>
                    <Input type="number" min={0} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_bio")}</Label>
                    <Textarea value={bio} maxLength={300} onChange={(e) => setBio(e.target.value)} rows={3} />
                  </div>
                </section>
              )}

              {role === "volunteer_driver" && (
                <section className="space-y-3 border-t border-border pt-4">
                  <div>
                    <Label className="text-xs">{t("signup_vehicleType")} *</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger><SelectValue placeholder={t("signup_select")} /></SelectTrigger>
                      <SelectContent>
                        {VEHICLE_TYPES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_wheelchair")}</Label>
                    <div className="mt-1 flex gap-2">
                      <Button type="button" size="sm" variant={wheelchair === true ? "default" : "outline"} onClick={() => setWheelchair(true)}>{t("signup_yes")}</Button>
                      <Button type="button" size="sm" variant={wheelchair === false ? "default" : "outline"} onClick={() => setWheelchair(false)}>{t("signup_no")}</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_serviceArea")} *</Label>
                    <Select value={serviceArea} onValueChange={setServiceArea}>
                      <SelectTrigger><SelectValue placeholder={t("signup_select")} /></SelectTrigger>
                      <SelectContent>
                        {SERVICE_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">{t("signup_availability")} *</Label>
                    <div className="mt-1 grid grid-cols-2 gap-1.5">
                      {DAYS.map((d) => (
                        <label key={d} className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-xs cursor-pointer hover:bg-secondary">
                          <Checkbox checked={availability.includes(d)} onCheckedChange={() => toggleAvailability(d)} />
                          {d}
                        </label>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {role && (
                <Button type="submit" disabled={!canSubmit} className="w-full gradient-primary text-primary-foreground hover:opacity-95 h-11">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("signup_create")}
                </Button>
              )}

              <p className="text-center text-xs text-muted-foreground">
                {t("signup_haveAccount")}{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">{t("signIn")}</Link>
              </p>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon, label, desc, selected, onClick, emoji }: { icon: React.ReactNode; label: string; desc: string; selected: boolean; onClick: () => void; emoji: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition-base",
        selected ? "border-primary bg-primary-soft" : "border-border bg-background hover:border-primary/40"
      )}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", selected && "text-primary")}>{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
