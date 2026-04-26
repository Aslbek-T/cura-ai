import { useState } from "react";
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
import { toast } from "sonner";
import { Search, Plus, X, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
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
  "Metformin", "Lisinopril", "Atorvastatin", "Amlodipine",
  "Omeprazole", "Albuterol", "Insulin Glargine", "Furosemide",
];

interface Med {
  name: string;
  dosage: string;
  frequency: string;
}

interface FoundProfile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
}

export function AddPatientSheet({ open, onOpenChange, onSuccess }: { open: boolean; onOpenChange: (o: boolean) => void; onSuccess: () => void }) {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [searchQ, setSearchQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<FoundProfile | null>(null);
  const [searchedNoResult, setSearchedNoResult] = useState(false);

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
    setSearchQ(""); setFound(null); setSearchedNoResult(false);
    setFirst(""); setLast(""); setDob(""); setPhone(""); setPrefLang("en");
    setConditions([]); setOtherCondition(""); setMeds([]); setAllergies([]); setAllergyInput("");
    setEmName(""); setEmPhone(""); setNotes("");
  };

  const handleSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    setFound(null);
    setSearchedNoResult(false);
    const q = searchQ.trim();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, role")
      .or(`email.eq.${q},phone.eq.${q}`)
      .eq("role", "patient")
      .maybeSingle();
    setSearching(false);
    if (data) {
      setFound(data as FoundProfile);
    } else {
      setSearchedNoResult(true);
    }
  };

  const handleLink = async () => {
    if (!found || !user) return;
    setSubmitting(true);
    const { data: existing } = await supabase.from("patients").select("id").eq("id", found.id).maybeSingle();
    if (existing) {
      await supabase.from("patients").update({ assigned_doctor_id: user.id }).eq("id", found.id);
    } else {
      await supabase.from("patients").insert({
        id: found.id,
        conditions: [],
        medications: [],
        allergies: [],
        assigned_doctor_id: user.id,
      });
    }
    setSubmitting(false);
    toast.success(t("addPatient_linked"));
    reset();
    onOpenChange(false);
    onSuccess();
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
    if (!first.trim() || !last.trim() || !dob) {
      toast.error(lang === "es" ? "Completa nombre, apellido y fecha de nacimiento" : "Fill name, last name and date of birth");
      return;
    }
    setSubmitting(true);

    const tempPw = `CuraTemp${Math.floor(1000 + Math.random() * 9000)}`;
    const fakeEmail = `patient${Date.now()}${Math.floor(Math.random() * 1000)}@cura.local`;
    const fullName = `${first.trim()} ${last.trim()}`;

    const finalConditions = [
      ...conditions.filter((c) => c !== "Other"),
      ...(conditions.includes("Other") && otherCondition.trim() ? [otherCondition.trim()] : []),
    ];

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: fakeEmail,
      password: tempPw,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role: "patient",
          preferred_language: prefLang,
        },
      },
    });

    if (signUpErr) {
      setSubmitting(false);
      toast.error(signUpErr.message);
      return;
    }

    const newPatientId = signUpData.user?.id;
    if (!newPatientId) {
      setSubmitting(false);
      toast.error(lang === "es" ? "No se pudo crear el usuario" : "Could not create user");
      return;
    }

    await supabase.from("patients").insert({
      id: newPatientId,
      conditions: finalConditions,
      medications: meds.filter((m) => m.name.trim()) as any,
      allergies,
      assigned_doctor_id: user.id,
      emergency_contact: emName ? `${emName}${emPhone ? ` ${emPhone}` : ""}` : null,
    });

    await supabase.from("profiles").update({
      phone: phone || null,
      date_of_birth: dob,
    }).eq("id", newPatientId);

    await supabase.auth.signOut();

    setSubmitting(false);
    toast.success(
      `${t("addPatient_success")}. ${lang === "es" ? "Credenciales temporales" : "Temporary credentials"}: ${fakeEmail} / ${tempPw}`,
      { duration: 12000 }
    );

    toast.info(lang === "es" ? "Por favor inicia sesión de nuevo para continuar" : "Please sign in again to continue", { duration: 8000 });

    reset();
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            {t("addPatient_title")}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section className="rounded-xl border border-border bg-secondary/30 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {lang === "es" ? "Buscar paciente existente" : "Search existing patient"}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={t("addPatient_search")}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
              />
              <Button onClick={handleSearch} disabled={searching || !searchQ.trim()} variant="outline" className="gap-1.5">
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {t("addPatient_searchBtn")}
              </Button>
            </div>
            {found && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-background p-3">
                <div>
                  <p className="text-sm font-semibold">{found.full_name}</p>
                  <p className="text-xs text-muted-foreground">{found.email || found.phone}</p>
                </div>
                <Button size="sm" onClick={handleLink} disabled={submitting} className="gradient-primary text-primary-foreground gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("addPatient_link")}
                </Button>
              </div>
            )}
            {searchedNoResult && !found && (
              <p className="mt-3 text-xs text-muted-foreground">{t("addPatient_notFound")}</p>
            )}
          </section>

          <section>
            <h4 className="mb-3 text-sm font-semibold">{t("addPatient_info")}</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t("signup_first")} *</Label>
                <Input value={first} onChange={(e) => setFirst(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{t("signup_last")} *</Label>
                <Input value={last} onChange={(e) => setLast(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{t("signup_dob")} *</Label>
                <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{t("signup_phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+15205550100" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">{t("signup_lang")}</Label>
                <div className="mt-1 flex gap-2">
                  <Button type="button" size="sm" variant={prefLang === "en" ? "default" : "outline"} onClick={() => setPrefLang("en")}>English</Button>
                  <Button type="button" size="sm" variant={prefLang === "es" ? "default" : "outline"} onClick={() => setPrefLang("es")}>Español</Button>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold">{t("addPatient_medProfile")}</h4>
            <p className="mb-3 text-xs text-muted-foreground">{t("addPatient_selectAll")}</p>
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
                placeholder={t("addPatient_describeOther")}
                value={otherCondition}
                onChange={(e) => setOtherCondition(e.target.value)}
              />
            )}
          </section>

          <section>
            <h4 className="text-sm font-semibold">{t("signup_meds")}</h4>
            <p className="mb-2 text-xs text-muted-foreground">{t("addPatient_quickAdd")}</p>
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
                  <Input className="flex-[2]" placeholder={t("signup_medName")} value={m.name} onChange={(e) => updateMed(i, { name: e.target.value })} />
                  <Input className="flex-1" placeholder="500mg" value={m.dosage} onChange={(e) => updateMed(i, { dosage: e.target.value })} />
                  <Select value={m.frequency} onValueChange={(v) => updateMed(i, { frequency: v })}>
                    <SelectTrigger className="flex-[1.3]"><SelectValue placeholder={t("signup_medFreq")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once daily">{t("signup_freq_once")}</SelectItem>
                      <SelectItem value="twice daily">{t("signup_freq_twice")}</SelectItem>
                      <SelectItem value="three times daily">{t("signup_freq_three")}</SelectItem>
                      <SelectItem value="as needed">{t("signup_freq_asneeded")}</SelectItem>
                      <SelectItem value="weekly">{t("signup_freq_weekly")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" onClick={() => removeMed(i)} aria-label="Remove"><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => addMed()}>
                <Plus className="h-3.5 w-3.5" /> {t("signup_addMed")}
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <div>
              <Label className="text-xs">{t("allergies")}</Label>
              <Input
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={handleAllergyKey}
                placeholder={t("signup_allergiesHint")}
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
                <Label className="text-xs">{t("signup_emergencyName")}</Label>
                <Input value={emName} onChange={(e) => setEmName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">{t("signup_emergencyPhone")}</Label>
                <Input value={emPhone} onChange={(e) => setEmPhone(e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs">{t("addPatient_clinicalNotes")}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("addPatient_clinicalNotesHint")}
                rows={3}
              />
            </div>
          </section>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full gradient-primary text-primary-foreground gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {t("addPatient_submit")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
