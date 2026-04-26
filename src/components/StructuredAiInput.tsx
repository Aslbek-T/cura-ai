import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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

const SYMPTOMS = [
  { id: "headache", emoji: "🤕", en: "Headache", es: "Dolor de cabeza" },
  { id: "dizziness", emoji: "😵", en: "Dizziness", es: "Mareo" },
  { id: "shortness", emoji: "😮‍💨", en: "Shortness of breath", es: "Falta de aire" },
  { id: "chest_pain", emoji: "🫀", en: "Chest pain", es: "Dolor de pecho" },
  { id: "swollen", emoji: "🦶", en: "Swollen feet", es: "Pies hinchados" },
  { id: "fatigue", emoji: "😴", en: "Fatigue", es: "Fatiga" },
  { id: "nausea", emoji: "🤢", en: "Nausea", es: "Náusea" },
  { id: "blurred", emoji: "👁️", en: "Blurred vision", es: "Visión borrosa" },
  { id: "thirst", emoji: "💧", en: "Excessive thirst", es: "Sed excesiva" },
  { id: "fever", emoji: "🔥", en: "Fever", es: "Fiebre" },
  { id: "med_side", emoji: "💊", en: "Medication side effect", es: "Efecto secundario" },
  { id: "anxiety", emoji: "😰", en: "Anxiety", es: "Ansiedad" },
] as const;

const REACTIONS = [
  "Nausea after taking",
  "Dizziness after taking",
  "Stomach upset",
  "Rash",
  "No reactions",
] as const;

interface Props {
  patientName: string;
  patientAge: number | null;
  conditions: string[];
  medications: Med[];
  loading: boolean;
  onSubmit: (val: StructuredInputValue) => void;
}

export function StructuredAiInput({ medications, loading, onSubmit }: Props) {
  const { lang, t } = useLanguage();
  const [feeling, setFeeling] = useState<string>("");
  const [feelingGood, setFeelingGood] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [otherSymptomSelected, setOtherSymptomSelected] = useState(false);
  const [otherSymptomText, setOtherSymptomText] = useState("");
  const [severity, setSeverity] = useState<number>(5);
  const [medAdherence, setMedAdherence] = useState<Record<string, boolean | undefined>>({});
  const [tookAllMeds, setTookAllMeds] = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const sevColor = severity <= 3 ? "bg-success text-success-foreground" : severity <= 6 ? "bg-warning text-warning-foreground" : "bg-destructive text-destructive-foreground";
  const sevLabel = severity <= 3 ? t("nav_sev_mild") : severity <= 6 ? t("nav_sev_mod") : t("nav_sev_severe");

  const anyMedAnswered = Object.values(medAdherence).some((v) => v !== undefined);
  const hasOtherSymptom = otherSymptomSelected && !!otherSymptomText.trim();
  const canSubmit = (feelingGood || (feeling && (symptoms.length > 0 || hasOtherSymptom))) && !loading;

  const buildSummary = (): string => {
    if (feelingGood) {
      const respond = lang === "es" ? "Spanish" : "English";
      return `Patient reports feeling good today with no symptoms. Medications taken as scheduled. No concerns to report. Please respond in ${respond} based on the patient's language preference.`;
    }
    const medsAnswered = medications
      .filter((m) => typeof medAdherence[m.name] === "boolean")
      .map((m) => `${m.name}: ${medAdherence[m.name] ? "Yes" : "No"}`);
    const allTaken = tookAllMeds || (medications.length > 0 && medications.every((m) => medAdherence[m.name] === true));
    const medsStr = medications.length === 0
      ? "none"
      : allTaken
        ? "all taken"
        : medsAnswered.length ? medsAnswered.join(", ") : "none";

    const reactionsStr = reactions.length ? reactions.join(", ") : "none";
    const notesStr = notes.trim() ? notes.trim() : "none";
    const feelingLabel = t(`nav_feeling_${feeling}` as any);
    const symptomLabels = symptoms.map((id) => {
      const s = SYMPTOMS.find((x) => x.id === id);
      return s ? s[lang] : id;
    });
    if (hasOtherSymptom) symptomLabels.push(otherSymptomText.trim());
    const respond = lang === "es" ? "Spanish" : "English";
    return `Patient feeling: ${feelingLabel}. Symptoms: ${symptomLabels.join(", ")}. Severity: ${severity}/10. Medications taken: ${medsStr}. Reactions: ${reactionsStr}. Notes: ${notesStr}. Please respond in ${respond} based on the patient's language preference.`;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const adherence: Record<string, boolean> = {};
    Object.entries(medAdherence).forEach(([k, v]) => { if (typeof v === "boolean") adherence[k] = v; });

    if (feelingGood && medications.length > 0) {
      medications.forEach((m) => { adherence[m.name] = true; });
    }
    onSubmit({
      feeling: feelingGood ? "good" : feeling,
      symptoms: feelingGood ? [] : [...symptoms, ...(hasOtherSymptom ? [otherSymptomText.trim()] : [])],
      severity: feelingGood ? 1 : severity,
      medAdherence: adherence,
      reactions,
      notes,
      rawSummary: buildSummary(),
    });
  };

  const toggleSymptom = (id: string) => {
    if (id === "other_free") {
      setOtherSymptomSelected((p) => !p);
      if (otherSymptomSelected) setOtherSymptomText("");
      return;
    }
    setSymptoms((arr) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]));
  };

  const takeAllMeds = () => {
    if (!medications.length) return;
    const patch: Record<string, boolean> = {};
    medications.forEach((m) => { patch[m.name] = true; });
    setMedAdherence((p) => ({ ...p, ...patch }));
    setTookAllMeds(true);
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
                  ? "border-accent bg-accent-soft"
                  : "border-border bg-background hover:border-accent/40"
              )}
            >
              <span className="text-2xl">{f.emoji}</span>
              <span className="text-[10px] font-medium leading-tight text-center">{t(`nav_feeling_${f.key}` as any)}</span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFeelingGood(true);
            setFeeling("");
            setSymptoms([]);
            setOtherSymptomSelected(false);
            setOtherSymptomText("");
            setReactions([]);
            setNotes("");
          }}
          className="mt-3 w-full border-success text-success hover:bg-success/10"
        >
          {lang === "es" ? "Me siento bien hoy, sin problemas ✓" : "I'm feeling good today, no issues to report ✓"}
        </Button>
      </div>

      {/* STEP B: Symptoms */}
      {!feelingGood && (
      <div>
        <p className="mb-2 text-sm font-semibold">{t("nav_step_symptoms")} <span className="text-destructive">*</span></p>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {SYMPTOMS.map((s) => {
            const active = symptoms.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSymptom(s.id)}
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
          <button
            type="button"
            onClick={() => toggleSymptom("other_free")}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-base",
              otherSymptomSelected
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background hover:border-accent/50"
            )}
          >
            <span>✍️</span>
            <span>{lang === "es" ? "Otro síntoma" : "Other symptom"}</span>
          </button>
        </div>
        {otherSymptomSelected && (
          <Input
            className="mt-2"
            value={otherSymptomText}
            onChange={(e) => setOtherSymptomText(e.target.value)}
            placeholder={lang === "es" ? "Describe tu síntoma..." : "Describe your symptom..."}
          />
        )}
      </div>
      )}

      {/* STEP C: Severity */}
      {!feelingGood && (symptoms.length > 0 || hasOtherSymptom) && (
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
      {!feelingGood && medications.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">{t("nav_step_meds")}</p>
          <Button type="button" variant="outline" onClick={takeAllMeds} className="mb-2 w-full border-success text-success hover:bg-success/10">
            ✓ {lang === "es" ? "Tomé todos mis medicamentos hoy" : "Took all medications today"}
          </Button>
          <div className="space-y-1.5">
            {medications.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2 text-sm">
                <span>
                  {t("nav_med_taken")} <span className="font-semibold">{m.name}</span> {t("nav_med_today")}
                </span>
                <div className="flex gap-1">
                  {(["yes", "no"] as const).map((opt) => {
                    const val = opt === "yes";
                    const active = medAdherence[m.name] === val;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setMedAdherence((p) => ({ ...p, [m.name]: val }));
                          if (!val) setTookAllMeds(false);
                        }}
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
      {!feelingGood && anyMedAnswered && (
        <div>
          <p className="mb-2 text-sm font-semibold">{t("nav_step_reactions")}</p>
          <div className="flex flex-wrap gap-1.5">
            {REACTIONS.map((r) => {
              const active = reactions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggle(reactions, setReactions, r)}
                  className={cn(
                    "rounded-full border px-2.5 py-1.5 text-xs font-medium transition-base",
                    active
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-background hover:border-accent/50"
                  )}
                >
                  {lang === "es"
                    ? r === "Nausea after taking" ? "Náusea después de tomar"
                      : r === "Dizziness after taking" ? "Mareo después de tomar"
                        : r === "Stomach upset" ? "Malestar estomacal"
                          : r === "Rash" ? "Erupción"
                            : "Sin reacciones"
                    : r}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP F: Notes */}
      {!feelingGood && (
      <div>
        <p className="mb-2 text-sm font-semibold">{t("nav_step_notes")}</p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
          placeholder={t("nav_step_notes")}
        />
      </div>
      )}

      {/* SEND */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button onClick={handleSubmit} disabled={!canSubmit} className="gradient-primary text-primary-foreground hover:opacity-95 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("sendToCura")} →
        </Button>
      </div>
    </div>
  );
}
