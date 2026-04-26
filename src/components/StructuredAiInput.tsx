import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from "@/contexts/LanguageContext";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StructuredInputValue {
  feeling: string;
  symptoms: string[];
  severity: number;
  medAdherence: Record<string, boolean>;
  reactions: string[];
  notes: string;
  rawSummary: string;
}

interface Med { name: string; dosage: string; frequency: string }

const FEELINGS = [
  { key: "great", emoji: "😊" },
  { key: "ok", emoji: "🙂" },
  { key: "notgreat", emoji: "😐" },
  { key: "poor", emoji: "😟" },
  { key: "verybad", emoji: "😣" },
] as const;

const SYMPTOMS_EN = [
  { id: "headache", emoji: "🤕", en: "Headache", es: "Dolor de cabeza" },
  { id: "dizziness", emoji: "😵", en: "Dizziness", es: "Mareo" },
  { id: "shortness", emoji: "😮‍💨", en: "Shortness of breath", es: "Falta de aire" },
  { id: "chest_pain", emoji: "🫀", en: "Chest pain", es: "Dolor de pecho" },
  { id: "swollen", emoji: "🦶", en: "Swollen feet/legs", es: "Pies/piernas hinchadas" },
  { id: "fatigue", emoji: "😴", en: "Extreme fatigue", es: "Fatiga extrema" },
  { id: "nausea", emoji: "🤢", en: "Nausea", es: "Náusea" },
  { id: "blurred", emoji: "👁️", en: "Blurred vision", es: "Visión borrosa" },
  { id: "thirst", emoji: "💧", en: "Excessive thirst", es: "Sed excesiva" },
  { id: "fever", emoji: "🔥", en: "Fever", es: "Fiebre" },
  { id: "sweating", emoji: "😰", en: "Sweating", es: "Sudoración" },
  { id: "joint_pain", emoji: "🦴", en: "Joint pain", es: "Dolor articular" },
  { id: "med_side", emoji: "💊", en: "Medication side effect", es: "Efecto secundario" },
  { id: "anxiety", emoji: "😰", en: "Anxiety/worry", es: "Ansiedad/preocupación" },
  { id: "other", emoji: "❓", en: "Other", es: "Otro" },
];

const REACTIONS_EN = [
  { id: "nausea_after", en: "Nausea after taking", es: "Náusea al tomar" },
  { id: "dizzy_after", en: "Dizziness after taking", es: "Mareo al tomar" },
  { id: "stomach", en: "Stomach upset", es: "Malestar estomacal" },
  { id: "rash", en: "Rash or itching", es: "Erupción o picazón" },
  { id: "none", en: "No reactions", es: "Sin reacciones" },
  { id: "other", en: "Other reaction", es: "Otra reacción" },
];

interface Props {
  patientName: string;
  patientAge: number | null;
  conditions: string[];
  medications: Med[];
  loading: boolean;
  onSubmit: (val: StructuredInputValue) => void;
}

export function StructuredAiInput({ patientName, patientAge, conditions, medications, loading, onSubmit }: Props) {
  const { lang, t } = useLanguage();

  const [feeling, setFeeling] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<number>(5);
  const [medAdherence, setMedAdherence] = useState<Record<string, boolean | undefined>>({});
  const [reactions, setReactions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const sevColor = severity <= 3 ? "bg-success text-success-foreground" : severity <= 6 ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground";
  const sevLabel = severity <= 3 ? t("nav_sev_mild") : severity <= 6 ? t("nav_sev_mod") : t("nav_sev_severe");

  const anyMedAnswered = Object.values(medAdherence).some((v) => v !== undefined);
  const canSubmit = feeling && symptoms.length > 0 && !loading;

  const symptomLabel = (id: string) => {
    const s = SYMPTOMS_EN.find((x) => x.id === id);
    return s ? s[lang] : id;
  };

  const reactionLabel = (id: string) => {
    const r = REACTIONS_EN.find((x) => x.id === id);
    return r ? r[lang] : id;
  };

  const buildSummary = (): string => {
    const feelingLabel = t(`nav_feeling_${feeling}` as any);
    const ageStr = patientAge ? `, ${patientAge}${lang === "es" ? "a" : "y"}` : "";
    const condStr = conditions.length ? conditions.join(", ") : (lang === "es" ? "ninguna" : "none");
    const medsStr = medications.length
      ? medications.map((m) => `${m.name} ${m.dosage} (${lang === "es" ? "tomado" : "taken"}: ${medAdherence[m.name] === true ? (lang === "es" ? "sí" : "yes") : medAdherence[m.name] === false ? "no" : "?"})`).join(", ")
      : (lang === "es" ? "ninguno" : "none");
    const symptomsStr = symptoms.map((s) => `${symptomLabel(s)} (${lang === "es" ? "severidad" : "severity"} ${severity}/10)`).join(", ");
    const reactionsStr = reactions.length ? reactions.map(reactionLabel).join(", ") : (lang === "es" ? "ninguna" : "none");
    const respond = lang === "es" ? "Responde en español." : "Respond in English.";
    return `Patient: ${patientName}${ageStr}. Conditions: ${condStr}. Medications: ${medsStr}. Overall feeling: ${feelingLabel}. Symptoms reported: ${symptomsStr}. Medication reactions: ${reactionsStr}. Additional notes: ${notes || "none"}. ${respond}`;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const adherence: Record<string, boolean> = {};
    Object.entries(medAdherence).forEach(([k, v]) => { if (typeof v === "boolean") adherence[k] = v; });
    onSubmit({
      feeling,
      symptoms,
      severity,
      medAdherence: adherence,
      reactions,
      notes,
      rawSummary: buildSummary(),
    });
  };

  return (
    <div className="space-y-5">
      {/* STEP A: Feeling */}
      <div>
        <p className="mb-2 text-sm font-semibold">{t("nav_step_feeling")} <span className="text-destructive">*</span></p>
        <div className="grid grid-cols-5 gap-2">
          {FEELINGS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFeeling(f.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 transition-base",
                feeling === f.key
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-background hover:border-primary/40"
              )}
            >
              <span className="text-2xl">{f.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{t(`nav_feeling_${f.key}` as any)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* STEP B: Symptoms */}
      <div>
        <p className="mb-2 text-sm font-semibold">{t("nav_step_symptoms")} <span className="text-destructive">*</span></p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {SYMPTOMS_EN.map((s) => {
            const active = symptoms.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(symptoms, setSymptoms, s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-base",
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background hover:border-accent/50"
                )}
              >
                <span>{s.emoji}</span>
                <span>{s[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP C: Severity */}
      {symptoms.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">{t("nav_step_severity")}</p>
            <Badge className={cn("border-0", sevColor)}>{severity}/10 · {sevLabel}</Badge>
          </div>
          <Slider value={[severity]} min={1} max={10} step={1} onValueChange={(v) => setSeverity(v[0])} />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>1 {t("nav_sev_mild")}</span>
            <span>5 {t("nav_sev_mod")}</span>
            <span>10 {t("nav_sev_severe")}</span>
          </div>
        </div>
      )}

      {/* STEP D: Medication adherence */}
      {medications.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">{t("nav_step_meds")}</p>
          <div className="space-y-1.5">
            {medications.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                <span>
                  {t("nav_med_taken")} <span className="font-semibold">{m.name} {m.dosage}</span> {t("nav_med_today")}
                </span>
                <div className="flex gap-1">
                  {(["yes", "no"] as const).map((opt) => {
                    const val = opt === "yes";
                    const active = medAdherence[m.name] === val;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setMedAdherence((p) => ({ ...p, [m.name]: val }))}
                        className={cn(
                          "rounded-full border px-3 py-0.5 text-xs font-medium transition-base",
                          active
                            ? (val ? "border-success bg-success/15 text-success" : "border-destructive bg-destructive/10 text-destructive")
                            : "border-border bg-background hover:bg-secondary"
                        )}
                      >
                        {opt === "yes" ? t("signup_yes") : t("signup_no")}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP E: Reactions */}
      {anyMedAnswered && (
        <div>
          <p className="mb-2 text-sm font-semibold">{t("nav_step_reactions")}</p>
          <div className="flex flex-wrap gap-1.5">
            {REACTIONS_EN.map((r) => {
              const active = reactions.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggle(reactions, setReactions, r.id)}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-xs font-medium transition-base",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background hover:border-accent/50"
                  )}
                >
                  {r[lang]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP F: Notes */}
      <div>
        <p className="mb-2 text-sm font-semibold">{t("nav_step_notes")}</p>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="resize-none" />
      </div>

      {/* SEND */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Badge variant="outline" className="gap-1.5 text-xs border-accent/30 text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {t("respondingIn")}: {lang === "es" ? `${t("langSpanish")} 🇲🇽` : `${t("langEnglish")} 🇺🇸`}
        </Badge>
        <Button onClick={handleSubmit} disabled={!canSubmit} className="gradient-primary text-primary-foreground hover:opacity-95 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("sendToCura")} →
        </Button>
      </div>
    </div>
  );
}
