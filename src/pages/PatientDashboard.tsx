import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Sparkles, Send, Loader2, Pill, Calendar, Car, Flag,
  MessageCircle, Bot, Stethoscope, ChevronDown, Phone, Video,
  CheckCircle2, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StructuredAiInput, StructuredInputValue } from "@/components/StructuredAiInput";
import { calculateAge } from "@/lib/i18n";

interface PatientRow {
  id: string;
  conditions: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  allergies: string[];
  assigned_doctor_id: string | null;
}

interface TimelineEvent {
  id: string;
  event_type: string;
  content: Record<string, string>;
  created_at: string;
}

interface Appointment {
  id: string;
  scheduled_at: string;
  appointment_type: string;
  status: string;
  doctor_id: string;
}

interface RideRequest {
  id: string;
  pickup_address: string;
  destination: string;
  requested_date: string;
  status: string;
  created_at: string;
}

const MOCK_AI_RESPONSE = {
  en: "Maria, based on your history with Type 2 Diabetes and Hypertension, the symptoms you describe need attention. Rest, drink water, and check your blood sugar in 30 minutes. If symptoms continue for more than 2 hours, contact Dr. Chen — I can flag this for him now.",
  es: "María, basándome en tu historial con Diabetes Tipo 2 e Hipertensión, los síntomas que describes necesitan atención. Descansa, toma agua y revisa tu glucosa en 30 minutos. Si los síntomas continúan por más de 2 horas, contacta al Dr. Chen — puedo avisarle ahora.",
};

const eventIcon = (type: string) => {
  switch (type) {
    case "sms_checkin": return <MessageCircle className="h-4 w-4" />;
    case "ai_advice": return <Bot className="h-4 w-4" />;
    case "doctor_note": return <Stethoscope className="h-4 w-4" />;
    case "appointment": return <Calendar className="h-4 w-4" />;
    case "ride_request": return <Car className="h-4 w-4" />;
    case "medication": return <Pill className="h-4 w-4" />;
    default: return <MessageCircle className="h-4 w-4" />;
  }
};

const eventStyle = (type: string) => {
  switch (type) {
    case "sms_checkin": return { dot: "bg-muted text-muted-foreground", border: "border-l-muted-foreground/40" };
    case "ai_advice": return { dot: "bg-accent-soft text-accent", border: "border-l-accent" };
    case "doctor_note": return { dot: "bg-primary-soft text-primary", border: "border-l-primary" };
    case "appointment": return { dot: "bg-primary-soft text-primary", border: "border-l-primary" };
    case "ride_request": return { dot: "bg-success/10 text-success", border: "border-l-success" };
    case "medication": return { dot: "bg-emerald-100 text-emerald-700", border: "border-l-emerald-500" };
    default: return { dot: "bg-muted text-muted-foreground", border: "border-l-muted-foreground/40" };
  }
};

type FilterKey = "all" | "checkins" | "ai" | "appts" | "rides";

const FILTER_TYPES: Record<FilterKey, string[] | null> = {
  all: null,
  checkins: ["sms_checkin"],
  ai: ["ai_advice"],
  appts: ["appointment"],
  rides: ["ride_request"],
};

export default function PatientDashboard() {
  const { profile, user } = useAuth();
  const { t, lang } = useLanguage();

  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [rides, setRides] = useState<RideRequest[]>([]);
  const [doctorName, setDoctorName] = useState<string>("Dr. Chen");
  const [loading, setLoading] = useState(true);

  const [lastInput, setLastInput] = useState<StructuredInputValue | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiTimestamp, setAiTimestamp] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFlagged, setAiFlagged] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  const [ridePickup, setRidePickup] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [rideDest, setRideDest] = useState("Banner University Medical Center, Tucson, AZ");
  const [rideSubmitting, setRideSubmitting] = useState(false);

  const [filter, setFilter] = useState<FilterKey>("all");
  const [smsOpen, setSmsOpen] = useState(true);
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [patRes, tlRes, apptRes, rideRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("health_timeline").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("appointments").select("*").eq("patient_id", user.id).neq("status", "completed").order("scheduled_at", { ascending: true }),
      supabase.from("ride_requests").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }),
    ]);
    setPatient((patRes.data as unknown as PatientRow) ?? null);
    setTimeline((tlRes.data as unknown as TimelineEvent[]) ?? []);
    setAppointments((apptRes.data as Appointment[]) ?? []);
    setRides((rideRes.data as RideRequest[]) ?? []);

    if (patRes.data?.assigned_doctor_id) {
      const { data: doc } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", patRes.data.assigned_doctor_id)
        .maybeSingle();
      if (doc?.full_name) setDoctorName(doc.full_name);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAiSubmit = async (val: StructuredInputValue) => {
    setLastInput(val);
    setAiLoading(true);
    setAiResponse(null);
    setAiFlagged(false);
    setAiSaved(false);

    // Save sms_checkin event with structured input
    if (user) {
      await supabase.from("health_timeline").insert({
        patient_id: user.id,
        event_type: "sms_checkin",
        content: {
          en: `Check-in: feeling ${val.feeling}, symptoms: ${val.symptoms.join(", ")} (severity ${val.severity}/10).`,
          es: `Chequeo: sintiéndose ${val.feeling}, síntomas: ${val.symptoms.join(", ")} (severidad ${val.severity}/10).`,
          structured_input: JSON.stringify({
            feeling: val.feeling,
            symptoms: val.symptoms,
            severity: val.severity,
            medication_adherence: val.medAdherence,
            reactions: val.reactions,
          }),
          raw_summary: val.rawSummary,
          language: lang,
        },
      });
    }

    await new Promise((r) => setTimeout(r, 1800));
    setAiResponse(MOCK_AI_RESPONSE[lang]);
    setAiTimestamp(new Date().toISOString());
    setAiLoading(false);
    loadData();
  };

  const insertAdvice = async (flagged: boolean) => {
    if (!user || !aiResponse) return;
    const summary = lastInput?.rawSummary ?? "";
    const { error } = await supabase.from("health_timeline").insert({
      patient_id: user.id,
      event_type: "ai_advice",
      content: {
        en: `Patient summary: ${summary}. AI advice: ${MOCK_AI_RESPONSE.en}`,
        es: `Resumen del paciente: ${summary}. Consejo IA: ${MOCK_AI_RESPONSE.es}`,
        flagged: flagged ? "true" : "false",
      },
    });
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const handleFlag = async () => {
    if (await insertAdvice(true)) {
      setAiFlagged(true);
      toast.success(t("flagged"));
      loadData();
    }
  };

  const handleSave = async () => {
    if (await insertAdvice(false)) {
      setAiSaved(true);
      toast.success(t("savedToTimeline"));
      loadData();
    }
  };

  const handleRideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ridePickup || !rideDate || !rideDest) {
      toast.error(t("errInvalid"));
      return;
    }
    setRideSubmitting(true);
    const { error } = await supabase.from("ride_requests").insert({
      patient_id: user.id,
      pickup_address: ridePickup,
      destination: rideDest,
      requested_date: rideDate,
    });
    setRideSubmitting(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("rideSuccess"));
      setRidePickup("");
      setRideDate("");
      loadData();
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const nextAppt = appointments[0];
  const openRideCount = rides.filter((r) => r.status === "open").length;

  const daysUntilAppt = useMemo(() => {
    if (!nextAppt) return null;
    const ms = new Date(nextAppt.scheduled_at).getTime() - Date.now();
    return Math.max(0, Math.round(ms / 86400000));
  }, [nextAppt]);

  const filteredTimeline = useMemo(() => {
    const types = FILTER_TYPES[filter];
    if (!types) return timeline;
    return timeline.filter((e) => types.includes(e.event_type));
  }, [timeline, filter]);

  const greeting = lang === "es" ? "Buenos días" : "Good morning";

  return (
    <AppShell title={t("patientDashboard")} extras={<NotificationBell count={openRideCount + (nextAppt ? 1 : 0)} />}>
      {/* Welcome Banner */}
      <section className="mb-6 overflow-hidden rounded-2xl shadow-elevated">
        <div className="gradient-primary p-6 text-primary-foreground md:p-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            {greeting}, {firstName} 👋
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {loading ? (
              <Skeleton className="h-6 w-32 bg-white/20" />
            ) : (
              patient?.conditions?.map((c) => (
                <Badge key={c} className="border-0 bg-white/20 text-white hover:bg-white/25 font-medium backdrop-blur-sm">
                  {c}
                </Badge>
              ))
            )}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <BannerStat
              label={t("nextAppointment")}
              value={loading ? "…" : nextAppt ? (lang === "es" ? `en ${daysUntilAppt}d` : `in ${daysUntilAppt}d`) : t("none")}
            />
            <BannerStat
              label={t("medications")}
              value={loading ? "…" : `${patient?.medications?.length ?? 0} ${lang === "es" ? "activos" : "active"}`}
            />
            <BannerStat label={t("openRides")} value={loading ? "…" : `${openRideCount}`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="space-y-6 lg:col-span-2">
          {/* AI Companion */}
          <Card className="overflow-hidden border-border/60 shadow-elevated">
            <div className="border-b border-border bg-gradient-to-br from-accent-soft to-primary-soft/40 px-6 py-5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-floating">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{t("navigatorTitle")}</h3>
                  <p className="text-xs text-muted-foreground">{t("navigatorSubtitle")}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3 p-6">
              <StructuredAiInput
                patientName={profile?.full_name ?? ""}
                patientAge={calculateAge(profile?.date_of_birth ?? null)}
                conditions={patient?.conditions ?? []}
                medications={patient?.medications ?? []}
                loading={aiLoading}
                onSubmit={handleAiSubmit}
              />

              {aiLoading && (
                <div className="flex items-center gap-3 rounded-xl bg-accent-soft p-4 text-sm text-accent">
                  <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" />
                  <span className="ml-1 text-muted-foreground">{t("loading")}</span>
                </div>
              )}

              {aiResponse && !aiLoading && (
                <div className="rounded-xl border border-accent/20 bg-accent-soft p-4 animate-fade-in-up">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-floating">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-accent">Cura AI</p>
                      <p className="mt-1 text-sm leading-relaxed text-foreground">{aiResponse}</p>
                      {aiTimestamp && (
                        <p className="mt-2 text-[11px] text-muted-foreground">{timeAgo(aiTimestamp, lang)}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={handleFlag} disabled={aiFlagged} variant="outline" size="sm" className="gap-1.5 border-orange/30 text-orange hover:bg-orange-soft hover:text-orange">
                      <Flag className="h-3.5 w-3.5" />
                      {aiFlagged ? `✓ ${t("flagged")}` : `${t("flagForDoctor")} 🚩`}
                    </Button>
                    <Button onClick={handleSave} disabled={aiSaved || aiFlagged} variant="outline" size="sm" className="gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {aiSaved ? `✓ ${t("savedToTimeline")}` : `${t("saveToTimeline")} ✓`}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="overflow-hidden border-border/60 shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-lg font-bold">{t("timelineTitle")}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["all", "checkins", "ai", "appts", "rides"] as FilterKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setFilter(k)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-base",
                      filter === k
                        ? "bg-primary text-primary-foreground shadow-card"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(`filter_${k}` as any)}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : filteredTimeline.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t("noTimeline")}</p>
              ) : (
                <ul className="space-y-2">
                  {filteredTimeline.map((ev) => {
                    const text = (ev.content[lang] || ev.content.en || "").slice(0, 140);
                    const style = eventStyle(ev.event_type);
                    return (
                      <li
                        key={ev.id}
                        className={cn("flex items-start gap-3 rounded-lg border-l-4 bg-secondary/30 p-3.5 transition-base hover:bg-secondary/60", style.border)}
                      >
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", style.dot)}>
                          {eventIcon(ev.event_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {t(`evt_${ev.event_type}` as any)}
                            </p>
                            <span className="text-xs text-muted-foreground">{timeAgo(ev.created_at, lang)}</span>
                          </div>
                          <p className="mt-1 text-sm text-foreground">{text}</p>
                          {ev.content.flagged === "true" && (
                            <Badge className="mt-2 border-0 bg-orange-soft text-orange text-xs hover:bg-orange-soft">⚠ {lang === "es" ? "Marcado" : "Flagged"}</Badge>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          <Card className="border-border/60 p-5 shadow-card">
            <h3 className="mb-3 text-base font-bold">{t("upcomingAppointments")}</h3>
            {loading ? (
              <Skeleton className="h-20 w-full rounded-lg" />
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">{t("noAppointments")}</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {appointments.map((appt) => (
                  <li key={appt.id} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-semibold">
                      {new Date(appt.scheduled_at).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
                        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{doctorName}</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="gap-1 text-xs">
                          {appt.appointment_type === "telehealth" ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                          {appt.appointment_type === "telehealth" ? t("telehealth") : t("inPerson")}
                        </Badge>
                        <Badge className={cn("border-0 text-xs", appt.status === "confirmed" ? "bg-success/15 text-success hover:bg-success/15" : "bg-primary-soft text-primary hover:bg-primary-soft")}>
                          {t(`status_${appt.status}` as any)}
                        </Badge>
                      </div>
                      {appt.appointment_type === "telehealth" && (
                        <Button asChild size="sm" className="gradient-primary text-primary-foreground gap-1">
                          <a href="#"><Video className="h-3 w-3" />{t("joinCall")}</a>
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Request a Ride */}
          <Card className="border-border/60 p-5 shadow-card">
            <h3 className="mb-1 text-base font-bold flex items-center gap-1.5"><Car className="h-4 w-4 text-accent" />{t("needRide")}</h3>
            <form onSubmit={handleRideSubmit} className="mt-3 space-y-3">
              <div>
                <Label htmlFor="rdate" className="text-xs font-semibold text-muted-foreground">{t("rideDate")}</Label>
                <Input id="rdate" type="date" min={new Date().toISOString().slice(0, 10)} value={rideDate} onChange={(e) => setRideDate(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="pickup" className="text-xs font-semibold text-muted-foreground">{t("pickupAddress")}</Label>
                <Input id="pickup" value={ridePickup} onChange={(e) => setRidePickup(e.target.value)} placeholder="123 Main St, Sells, AZ" required />
              </div>
              <div>
                <Label htmlFor="dest" className="text-xs font-semibold text-muted-foreground">{t("destination")}</Label>
                <Input id="dest" value={rideDest} onChange={(e) => setRideDest(e.target.value)} required />
              </div>
              <Button type="submit" disabled={rideSubmitting} className="w-full gradient-primary text-primary-foreground">
                {rideSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submitRide")}
              </Button>
            </form>
          </Card>

          {/* Medications */}
          <Card className="border-border/60 p-5 shadow-card">
            <h3 className="mb-3 text-base font-bold flex items-center gap-1.5"><Pill className="h-4 w-4 text-emerald-600" />{t("yourMedications")}</h3>
            {loading ? (
              <Skeleton className="h-16 w-full rounded-lg" />
            ) : !patient?.medications?.length ? (
              <p className="py-3 text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-2">
                {patient.medications.map((m, i) => {
                  const id = `med-${i}`;
                  return (
                    <li key={id} className="flex items-start justify-between gap-3 rounded-lg bg-secondary/40 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{m.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{m.dosage} · {m.frequency}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id={id}
                          checked={!!takenMeds[id]}
                          onCheckedChange={(v) => setTakenMeds((p) => ({ ...p, [id]: !!v }))}
                        />
                        <Label htmlFor={id} className="cursor-pointer text-[11px] text-muted-foreground">{t("markTaken")}</Label>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* SMS Simulator */}
      <section className="mt-6">
        <Card className="overflow-hidden border-border/60 shadow-card">
          <button
            onClick={() => setSmsOpen(!smsOpen)}
            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-base hover:bg-muted/40"
          >
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-soft text-orange">📱</span>
              <div>
                <p className="text-sm font-bold">{t("smsModeTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("smsModeSubtitle")}</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-base", smsOpen && "rotate-180")} />
          </button>
          {smsOpen && (
            <div className="border-t border-border bg-secondary/30 p-6">
              <div className="mx-auto max-w-[340px] rounded-[2rem] border-[6px] border-foreground/85 bg-card p-3 shadow-floating">
                <div className="mb-3 flex items-center justify-between rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Cura AI SMS</span>
                  <span>520-555-0100</span>
                </div>
                <div className="space-y-2">
                  <SmsBubble received>Cura AI: Hola María, ¿cómo te sientes hoy?</SmsBubble>
                  <SmsBubble>Me duelen los pies y estoy cansada</SmsBubble>
                  <SmsBubble received>Cura AI: Entendido María. Basándome en tu historial con diabetes, la hinchazón en los pies necesita atención. ¿Quieres que avise al Dr. Chen? Responde SÍ o NO</SmsBubble>
                  <SmsBubble>SÍ</SmsBubble>
                  <SmsBubble received>✓ Dr. Chen notificado. Recuerda tomar tu Metformin esta noche.</SmsBubble>
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">{t("poweredBy")}</p>
            </div>
          )}
        </Card>
      </section>
    </AppShell>
  );
}

function BannerStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/15 px-3 py-2 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

function NotificationBell({ count }: { count: number }) {
  return (
    <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-base hover:bg-secondary hover:text-foreground" aria-label="Notifications">
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-orange-foreground">
          {count}
        </span>
      )}
    </button>
  );
}

function SmsBubble({ children, received = false }: { children: React.ReactNode; received?: boolean }) {
  return (
    <div className={cn("flex", received ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-snug",
        received ? "rounded-bl-sm bg-secondary text-foreground" : "rounded-br-sm bg-accent text-accent-foreground"
      )}>
        {children}
      </div>
    </div>
  );
}
