import { useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Plus, X, Loader2, UserPlus, Search, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const CONDITIONS = [
  "Type 2 Diabetes", "Type 1 Diabetes",
  "Hypertension", "Heart Disease",
  "Coronary Artery Disease", "Heart Failure",
  "COPD", "Asthma",
  "Respiratory Illness", "Chronic Kidney Disease",
  "Obesity", "High Cholesterol",
  "Arthritis", "Depression",
  "Anxiety", "Other",
];

const COMMON_MEDS = [
  "Metformin", "Lisinopril", "Atorvastatin", "Amlodipine", "Albuterol", "Insulin",
];

interface Med {
  name: string;
  dosage: string;
  frequency: string;
}

type FoundProfile = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  created_at?: string | null;
};

type FoundPatientRow = {
  id: string;
  assigned_doctor_id: string | null;
  conditions: string[] | null;
  medications: any[] | null;
  allergies: string[] | null;
  created_at?: string | null;
};

export function AddPatientSheet({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (o: boolean) => void; onSuccess: () => void }) {
  const { lang } = useLanguage();
  const { user } = useAuth();

  // Search existing
  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchedNoResult, setSearchedNoResult] = useState(false);
  const [foundProfile, setFoundProfile] = useState<FoundProfile | null>(null);
  const [foundPatient, setFoundPatient] = useState<FoundPatientRow | null>(null);
  const [viewRecords, setViewRecords] = useState(false);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);

  const [email, setEmail] = useState("");

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [prefLang, setPrefLang] = useState<"en" | "es">("en");

  const [conditions, setConditions] = useState<string[]>([]);
  const [otherCondition, setOtherCondition] = useState("");

  const [meds, setMeds] = useState<Med[]>([]);

  const [allergies, setAllergies] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState("");

  const [emName, setEmName] = useState("");
  const [emPhone, setEmPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setSearchQ("");
    setSearching(false);
    setSearchedNoResult(false);
    setFoundProfile(null);
    setFoundPatient(null);
    setViewRecords(false);
    setRecordsLoading(false);
    setTimeline([]);
    setEmail("");
    setFirst(""); setLast(""); setDob(""); setPhone(""); setPrefLang("en");
    setConditions([]); setOtherCondition(""); setMeds([]); setAllergies([]); setAllergyInput("");
    setEmName(""); setEmPhone(""); setNotes("");
  };

  const handleSearch = async () => {
    if (!user) return;
    const q = searchQ.trim();
    if (!q) return;
    setSearching(true);
    setSearchedNoResult(false);
    setFoundProfile(null);
    setFoundPatient(null);
    setViewRecords(false);
    setTimeline([]);

    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at")
        .or(`email.eq.${q},phone.eq.${q}`)
        .eq("role", "patient")
        .maybeSingle();

      if (!prof) {
        setSearchedNoResult(true);
        setSearching(false);
        return;
      }

      setFoundProfile(prof as any);

      const { data: pat } = await supabase
        .from("patients")
        .select("id, assigned_doctor_id, conditions, medications, allergies, created_at")
        .eq("id", (prof as any).id)
        .maybeSingle();
      setFoundPatient((pat as any) ?? null);
    } finally {
      setSearching(false);
    }
  };

  const addToRoster = async () => {
    if (!user || !foundProfile) return;

    const alreadyAssigned = foundPatient?.assigned_doctor_id === user.id;
    if (alreadyAssigned) return;

    if (foundPatient?.assigned_doctor_id && foundPatient.assigned_doctor_id !== user.id) {
      const ok = window.confirm(
        lang === "es"
          ? "Actualmente asignado a otro doctor. ¿Agregar de todas formas?"
          : "Currently assigned to another doctor. Add anyway?"
      );
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      const { data: existing } = await supabase.from("patients").select("id").eq("id", foundProfile.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("patients").update({ assigned_doctor_id: user.id }).eq("id", foundProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("patients").insert({
          id: foundProfile.id,
          conditions: [],
          medications: [],
          allergies: [],
          assigned_doctor_id: user.id,
        } as any);
        if (error) throw error;
      }

      toast.success(lang === "es" ? "Paciente agregado a tu lista" : "Patient added to your roster");
      const { data: pat } = await supabase
        .from("patients")
        .select("id, assigned_doctor_id, conditions, medications, allergies, created_at")
        .eq("id", foundProfile.id)
        .maybeSingle();
      setFoundPatient((pat as any) ?? null);
      onSuccess();
    } catch (e: any) {
      toast.error(e?.message || "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const openRecords = async () => {
    if (!foundProfile) return;
    setViewRecords(true);
    setRecordsLoading(true);
    try {
      const [tlRes, patRes] = await Promise.all([
        supabase.from("health_timeline").select("*").eq("patient_id", foundProfile.id).order("created_at", { ascending: false }).limit(30),
        supabase.from("patients").select("id, assigned_doctor_id, conditions, medications, allergies, created_at").eq("id", foundProfile.id).maybeSingle(),
      ]);
      setTimeline(tlRes.data ?? []);
      setFoundPatient((patRes.data as any) ?? foundPatient);
    } finally {
      setRecordsLoading(false);
    }
  };

  const toggleCondition = (c: string) => {
    setConditions((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const addMed = (name = "") => setMeds((p) => [...p, { name, dosage: "", frequency: "" }]);
  const updateMed = (i: number, patch: Partial<Med>) => setMeds((p) => p.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  const removeMed = (i: number) => setMeds((p) => p.filter((_, idx) => idx !== i));

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

  const handleSubmit = async () => {
    if (!user) return;
    if (!first.trim() || !last.trim()) {
      toast.error(lang === "es" ? "Completa nombre y apellido" : "Fill first and last name");
      return;
    }
    setSubmitting(true);

    const fullName = `${first.trim()} ${last.trim()}`;
    const finalEmail = (email || "").trim() || (phone ? `${phone.replace(/\D/g, "")}@cura.demo` : `patient${Date.now()}@cura.demo`);
    const tempPw = `CuraTemp${Math.floor(1000 + Math.random() * 9000)}`;

    const finalConditions = [
      ...conditions.filter((c) => c !== "Other"),
      ...(conditions.includes("Other") && otherCondition.trim() ? [otherCondition.trim()] : []),
    ];

    try {
      // Create auth user without affecting the current doctor's session
      const url = import.meta.env.VITE_SUPABASE_URL as string;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
      const tempClient = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({
        email: finalEmail,
        password: tempPw,
        options: {
          data: { full_name: fullName, role: "patient", preferred_language: prefLang },
        },
      });
      if (signUpErr) throw signUpErr;
      const newId = signUpData.user?.id;
      if (!newId) throw new Error("Could not create auth user");

      // Ensure profile exists/updated (in many setups a trigger creates it)
      await supabase.from("profiles").upsert({
        id: newId,
        full_name: fullName,
        role: "patient",
        email: finalEmail,
        phone: phone || null,
        preferred_language: prefLang,
        date_of_birth: dob || null,
      } as any);

      const { error: patErr } = await supabase
        .from("patients")
        .insert({
          id: newId,
          conditions: finalConditions,
          medications: meds.filter((m) => m.name.trim()) as any,
          allergies,
          assigned_doctor_id: user.id,
          emergency_contact: emName ? `${emName}${emPhone ? ` ${emPhone}` : ""}` : null,
          clinical_notes: notes || null,
        } as any);
      if (patErr) throw patErr;

      if (notes.trim()) {
        await supabase.from("health_timeline").insert({
          patient_id: newId,
          event_type: "doctor_note",
          content: { en: notes.trim(), es: notes.trim() },
          created_by: user.id,
        } as any);
      }

      toast.success(
        lang === "es"
          ? `Paciente creado. Comparte acceso: ${finalEmail} / ${tempPw}`
          : `Patient created. Share login: ${finalEmail} / ${tempPw}`,
        { duration: 12000 }
      );
    } catch (e: any) {
      toast.error(e?.message || (lang === "es" ? "No se pudo crear el paciente" : "Could not create patient"));
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    reset();
    onOpenChange(false);
    onSuccess();
  };

  const canSubmit = useMemo(() => !submitting && !!first.trim() && !!last.trim(), [first, last, submitting]);

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {lang === "es" ? "Agregar paciente" : "Add Patient"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* SECTION 1: Search first */}
          <section className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "es" ? "Buscar primero" : "Search first"}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={lang === "es" ? "Buscar por correo o teléfono" : "Search by email or phone number"}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} disabled={searching || !searchQ.trim()} variant="outline" className="gap-1.5">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {lang === "es" ? "Buscar" : "Search"}
              </Button>
            </div>

            {foundProfile && (
              <div className="mt-3 rounded-lg bg-background p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{foundProfile.full_name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {foundProfile.email || "—"} · {foundProfile.phone || "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(foundPatient?.conditions ?? []).slice(0, 4).map((c) => (
                        <Badge key={c} className="bg-primary-soft text-primary border-0 text-xs hover:bg-primary-soft">{c}</Badge>
                      ))}
                      {((foundPatient?.conditions ?? []).length ?? 0) > 4 && (
                        <Badge variant="secondary" className="text-xs">+{(foundPatient?.conditions ?? []).length - 4}</Badge>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {lang === "es" ? "Se unió:" : "Date joined:"}{" "}
                      {new Date((foundProfile.created_at || foundPatient?.created_at || Date.now()) as any).toLocaleDateString(lang === "es" ? "es-MX" : "en-US")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {foundPatient?.assigned_doctor_id === user?.id ? (
                      <Badge className="border-0 bg-success/15 text-success hover:bg-success/15">
                        {lang === "es" ? "Ya está en tu lista" : "Already in your roster"}
                      </Badge>
                    ) : (
                      <Button onClick={addToRoster} disabled={submitting} className="gradient-primary text-primary-foreground gap-1.5">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                        {lang === "es" ? "Agregar a mi lista" : "Add to My Roster"}
                      </Button>
                    )}
                    <Button onClick={openRecords} variant="outline" className="gap-1.5">
                      <Eye className="h-4 w-4" />
                      {lang === "es" ? "Ver registros" : "View Their Records"}
                    </Button>
                  </div>
                </div>

                {viewRecords && (
                  <div className="mt-4 rounded-lg border border-border bg-card p-3">
                    {recordsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {lang === "es" ? "Cargando..." : "Loading..."}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{lang === "es" ? "Condiciones" : "Conditions"}</p>
                          <p className="mt-1 text-sm">{(foundPatient?.conditions ?? []).join(", ") || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{lang === "es" ? "Medicamentos" : "Medications"}</p>
                          <p className="mt-1 text-sm">{(foundPatient?.medications as any)?.map((m: any) => m.name || m).join(", ") || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{lang === "es" ? "Historial" : "Health timeline"}</p>
                          {timeline.length === 0 ? (
                            <p className="mt-1 text-sm text-muted-foreground">—</p>
                          ) : (
                            <ul className="mt-2 space-y-2">
                              {timeline.map((ev) => (
                                <li key={ev.id} className="rounded-md bg-secondary/40 px-3 py-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold">{ev.event_type}</span>
                                    <span className="text-muted-foreground">{new Date(ev.created_at).toLocaleString(lang === "es" ? "es-MX" : "en-US")}</span>
                                  </div>
                                  <p className="mt-1 text-muted-foreground">{ev.content?.[lang] || ev.content?.en || ev.content?.message || "—"}</p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {searchedNoResult && (
              <p className="mt-3 text-xs text-muted-foreground">
                {lang === "es"
                  ? "No se encontró una cuenta existente. Puedes crear un registro abajo."
                  : "No existing account found. You can create a patient record below."}
              </p>
            )}
          </section>

          {/* SECTION 2: Create new */}
          <section>
            <h4 className="mb-3 text-sm font-semibold">{lang === "es" ? "Información básica" : "Basic Info"}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">{lang === "es" ? "Correo (opcional)" : "Email (optional)"}</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="patient@cura.demo" />
              </div>
              <div>
                <Label className="text-xs">{lang === "es" ? "Nombre" : "First Name"} *</Label>
                <Input value={first} onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{lang === "es" ? "Apellido" : "Last Name"} *</Label>
                <Input value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{lang === "es" ? "Fecha de nacimiento" : "Date of Birth"}</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{lang === "es" ? "Teléfono" : "Phone Number"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15205550100" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">{lang === "es" ? "Idioma preferido" : "Preferred Language"}</Label>
                <div className="mt-1 flex gap-2">
                  <Button type="button" size="sm" variant={prefLang === "en" ? "default" : "outline"} onClick={() => setPrefLang("en")}>English</Button>
                  <Button type="button" size="sm" variant={prefLang === "es" ? "default" : "outline"} onClick={() => setPrefLang("es")}>Español</Button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold">{lang === "es" ? "Condiciones médicas" : "Medical Conditions"}</h4>
            <p className="mb-3 text-xs text-muted-foreground">{lang === "es" ? "Selecciona todas las que apliquen" : "Select all that apply"}</p>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((c) => {
                const active = conditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={cn(
                      "rounded-lg border p-2.5 text-left text-xs font-medium transition-base",
                      active
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            {conditions.includes("Other") && (
              <Input
                className="mt-2"
                placeholder={lang === "es" ? "Describe la condición" : "Describe the condition"}
                value={otherCondition}
                onChange={(e) => setOtherCondition(e.target.value)}
              />
            )}
          </section>

          <section>
            <h4 className="text-sm font-semibold">{lang === "es" ? "Medicamentos" : "Medications"}</h4>
            <p className="mb-2 text-xs text-muted-foreground">{lang === "es" ? "Agregar rápido" : "Quick add"}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {COMMON_MEDS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => addMed(m)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:border-primary hover:bg-primary-soft hover:text-primary transition-base"
                >
                  + {m}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {meds.map((m, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input className="flex-[2]" placeholder={lang === "es" ? "Medicamento" : "Medication name"} value={m.name} onChange={(e) => updateMed(i, { name: e.target.value })} />
                  <Input className="flex-1" placeholder="500mg" value={m.dosage} onChange={(e) => updateMed(i, { dosage: e.target.value })} />
                  <Select value={m.frequency} onValueChange={(v) => updateMed(i, { frequency: v })}>
                    <SelectTrigger className="flex-[1.3]"><SelectValue placeholder={lang === "es" ? "Frecuencia" : "Frequency"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Once daily">Once daily</SelectItem>
                      <SelectItem value="Twice daily">Twice daily</SelectItem>
                      <SelectItem value="Three times daily">Three times daily</SelectItem>
                      <SelectItem value="As needed">As needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => removeMed(i)} aria-label="Remove"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addMed()}>
                <Plus className="h-3.5 w-3.5" /> + Add Medication
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <Label className="text-xs">{lang === "es" ? "Alergias" : "Allergies"}</Label>
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={handleAllergyKey}
                placeholder={lang === "es" ? "Escribe y presiona Enter" : "Type and press Enter"}
              />
              {allergies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {allergies.map((a) => (
                    <Badge key={a} variant="secondary" className="gap-1">
                      {a}
                      <button type="button" onClick={() => setAllergies((p) => p.filter((x) => x !== a))} aria-label={`Remove ${a}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{lang === "es" ? "Contacto de emergencia (nombre)" : "Emergency Contact Name"}</Label>
                <Input value={emName} onChange={(e) => setEmName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{lang === "es" ? "Contacto de emergencia (teléfono)" : "Emergency Contact Phone"}</Label>
                <Input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">{lang === "es" ? "Notas clínicas (opcional)" : "Clinical Notes (optional)"}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={lang === "es" ? "Notas para el equipo clínico..." : "Notes for the clinical team..."
                }
                rows={3}
              />
            </div>
          </section>

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full gradient-primary text-primary-foreground gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {lang === "es" ? "Agregar paciente a la lista" : "Add Patient to Roster"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
