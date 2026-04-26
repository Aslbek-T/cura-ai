import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Sparkles, Send, Loader2, Pill, Calendar, Car, Flag,
  MessageCircle, Bot, Stethoscope, ChevronDown, Phone, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  en: "Maria, based on your history, dizziness combined with your high blood pressure needs attention. Rest, drink water, and if symptoms continue for more than 2 hours, contact Dr. Chen.",
  es: "María, basándome en tu historial, el mareo junto con tu presión arterial alta necesita atención. Descansa, toma agua y si los síntomas continúan por más de 2 horas, contacta al Dr. Chen.",
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

const eventColor = (type: string) => {
  switch (type) {
    case "sms_checkin": return "bg-blue-100 text-blue-700";
    case "ai_advice": return "bg-accent-soft text-accent";
    case "doctor_note": return "bg-primary-soft text-primary";
    case "appointment": return "bg-purple-100 text-purple-700";
    case "ride_request": return "bg-amber-100 text-amber-700";
    case "medication": return "bg-emerald-100 text-emerald-700";
    default: return "bg-muted text-muted-foreground";
  }
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

  // AI companion state
  const [symptoms, setSymptoms] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFlagged, setAiFlagged] = useState(false);

  // Ride form state
  const [ridePickup, setRidePickup] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [rideDest, setRideDest] = useState("Banner University Medical Center, Tucson, AZ");
  const [rideSubmitting, setRideSubmitting] = useState(false);

  // SMS panel
  const [smsOpen, setSmsOpen] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [patRes, tlRes, apptRes, rideRes] = await Promise.all([
      supabase.from("patients").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("health_timeline").select("*").eq("patient_id", user.id).order("created_at", { ascending: false }).limit(20),
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

  const handleAiSubmit = async () => {
    if (!symptoms.trim()) return;
    setAiLoading(true);
    setAiResponse(null);
    setAiFlagged(false);
    // simulated 2s
    await new Promise((r) => setTimeout(r, 2000));
    setAiResponse(MOCK_AI_RESPONSE[lang]);
    setAiLoading(false);
  };

  const handleFlag = async () => {
    if (!user || !aiResponse) return;
    const { error } = await supabase.from("health_timeline").insert({
      patient_id: user.id,
      event_type: "ai_advice",
      content: {
        en: `Patient reported: "${symptoms}". AI advice: ${MOCK_AI_RESPONSE.en}`,
        es: `Paciente reportó: "${symptoms}". Consejo IA: ${MOCK_AI_RESPONSE.es}`,
        flagged: "true",
        symptoms,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      setAiFlagged(true);
      toast.success(t("flagged"));
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
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t("rideSuccess"));
      setRidePickup("");
      setRideDate("");
      loadData();
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] ?? "";
  const nextAppt = appointments[0];
  const openRideCount = rides.filter((r) => r.status === "open").length;

  return (
    <AppShell title={t("patientDashboard")}>
      {/* Welcome Header */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("goodMorning")}, {firstName}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {loading ? (
            <Skeleton className="h-6 w-32" />
          ) : (
            patient?.conditions?.map((c) => (
              <Badge key={c} className="bg-primary-soft text-primary hover:bg-primary-soft border-0 font-medium">
                {c}
              </Badge>
            ))
          )}
        </div>

        {/* Stat row */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Card className="p-3 shadow-card">
            <p className="text-xs text-muted-foreground">{t("nextAppointment")}</p>
            <p className="mt-1 text-sm font-semibold">
              {loading ? <Skeleton className="h-4 w-20" /> : nextAppt ? new Date(nextAppt.scheduled_at).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric" }) : t("none")}
            </p>
          </Card>
          <Card className="p-3 shadow-card">
            <p className="text-xs text-muted-foreground">{t("medications")}</p>
            <p className="mt-1 text-sm font-semibold">{loading ? <Skeleton className="h-4 w-8" /> : `${patient?.medications?.length ?? 0}`}</p>
          </Card>
          <Card className="p-3 shadow-card">
            <p className="text-xs text-muted-foreground">{t("openRides")}</p>
            <p className="mt-1 text-sm font-semibold">{loading ? <Skeleton className="h-4 w-8" /> : openRideCount}</p>
          </Card>
        </div>
      </section>

      {/* AI Companion */}
      <section className="mb-6">
        <Card className="overflow-hidden border-border/60 shadow-elevated">
          <div className="gradient-primary p-5 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-lg font-semibold">{t("aiCompanion")}</h3>
            </div>
            <p className="mt-1 text-sm opacity-90">{t("howAreYou")}</p>
          </div>
          <div className="p-5 space-y-3">
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder={t("describeSymptoms")}
              rows={4}
              className="resize-none"
            />
            <Button onClick={handleAiSubmit} disabled={aiLoading || !symptoms.trim()} className="gradient-primary text-primary-foreground hover:opacity-95 gap-2">
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("sendToCura")}
            </Button>

            {aiLoading && (
              <div className="flex items-center gap-2 rounded-xl bg-accent-soft p-4 text-sm text-accent">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("loading")}</span>
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div className="rounded-xl bg-accent-soft border border-accent/20 p-4">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">{aiResponse}</p>
                </div>
                {!aiFlagged && (
                  <Button onClick={handleFlag} variant="outline" size="sm" className="mt-3 gap-1.5">
                    <Flag className="h-3.5 w-3.5" />
                    {t("flagForDoctor")}
                  </Button>
                )}
                {aiFlagged && (
                  <Badge className="mt-3 bg-success/10 text-success border-0">✓ {t("flagged")}</Badge>
                )}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Health Timeline */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">{t("timelineTitle")}</h3>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : timeline.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground shadow-card">{t("noTimeline")}</Card>
        ) : (
          <div className="space-y-2">
            {timeline.map((ev) => {
              const text = ev.content[lang] || ev.content.en || "";
              return (
                <Card key={ev.id} className="flex items-start gap-3 p-4 shadow-card transition-base hover:shadow-elevated">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", eventColor(ev.event_type))}>
                    {eventIcon(ev.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t(`evt_${ev.event_type}` as any)}
                      </p>
                      <span className="text-xs text-muted-foreground">{timeAgo(ev.created_at, lang)}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground">{text}</p>
                    {ev.content.flagged === "true" && (
                      <Badge className="mt-2 bg-warning/15 text-warning border-0 text-xs">⚠ {lang === "es" ? "Marcado" : "Flagged"}</Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Upcoming appointments */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">{t("upcomingAppointments")}</h3>
        {loading ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : appointments.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground shadow-card">{t("noAppointments")}</Card>
        ) : (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <Card key={appt.id} className="p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {new Date(appt.scheduled_at).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
                        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{doctorName}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs gap-1">
                        {appt.appointment_type === "telehealth" ? <Video className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                        {appt.appointment_type === "telehealth" ? t("telehealth") : t("inPerson")}
                      </Badge>
                      <Badge className={cn("text-xs border-0", appt.status === "confirmed" ? "bg-success/15 text-success" : "bg-primary-soft text-primary")}>
                        {t(`status_${appt.status}` as any)}
                      </Badge>
                    </div>
                  </div>
                  {appt.appointment_type === "telehealth" && (
                    <Button asChild size="sm" className="shrink-0 gradient-primary text-primary-foreground">
                      <a href="#">{t("joinCall")}</a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Ride request */}
      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">{t("requestRide")}</h3>
        <Card className="p-5 shadow-card">
          <form onSubmit={handleRideSubmit} className="space-y-3">
            <div>
              <Label htmlFor="rdate" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("rideDate")}</Label>
              <Input id="rdate" type="date" min={new Date().toISOString().slice(0, 10)} value={rideDate} onChange={(e) => setRideDate(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="pickup" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("pickupAddress")}</Label>
              <Input id="pickup" value={ridePickup} onChange={(e) => setRidePickup(e.target.value)} placeholder="123 Main St, Sells, AZ" required />
            </div>
            <div>
              <Label htmlFor="dest" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("destination")}</Label>
              <Input id="dest" value={rideDest} onChange={(e) => setRideDest(e.target.value)} required />
            </div>
            <Button type="submit" disabled={rideSubmitting} className="w-full gradient-primary text-primary-foreground">
              {rideSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("submitRide")}
            </Button>
          </form>

          {rides.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("yourRides")}</p>
              <div className="space-y-2">
                {rides.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{r.destination}</p>
                      <p className="text-xs text-muted-foreground">{new Date(r.requested_date).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <Badge className={cn("border-0 text-xs", r.status === "open" ? "bg-amber-100 text-amber-700" : r.status === "matched" ? "bg-primary-soft text-primary" : "bg-success/15 text-success")}>
                      {t(`ride_${r.status}` as any)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* SMS Simulator */}
      <section className="mb-6">
        <Card className="shadow-card">
          <button
            onClick={() => setSmsOpen(!smsOpen)}
            className="flex w-full items-center justify-between gap-3 p-4 text-left transition-base hover:bg-muted/40"
          >
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent" />
              <div>
                <p className="text-sm font-semibold">{t("smsTitle")}</p>
                <p className="text-xs text-muted-foreground">{t("smsSubtitle")}</p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-base", smsOpen && "rotate-180")} />
          </button>
          {smsOpen && (
            <div className="border-t border-border bg-muted/30 p-6">
              <div className="mx-auto max-w-[320px] rounded-3xl border-4 border-foreground/80 bg-card p-3 shadow-floating">
                <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cura AI · SMS</div>
                <div className="space-y-2 text-sm">
                  <SmsBubble received>Cura AI: Hola María, ¿cómo te sientes hoy? / Hello Maria, how are you feeling today?</SmsBubble>
                  <SmsBubble>Me duele la cabeza y estoy mareada</SmsBubble>
                  <SmsBubble received>Cura AI: Entendido María. Basándome en tu historial, esto puede estar relacionado con tu presión. Descansa y toma agua. ¿Quieres que avise al Dr. Chen? Responde SÍ o NO</SmsBubble>
                  <SmsBubble>SÍ</SmsBubble>
                  <SmsBubble received>Cura AI: ✓ El Dr. Chen ha sido notificado. Te contactará pronto. Recuerda tomar tu Lisinopril esta noche.</SmsBubble>
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

function SmsBubble({ children, received = false }: { children: React.ReactNode; received?: boolean }) {
  return (
    <div className={cn("flex", received ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-snug",
        received ? "rounded-bl-sm bg-muted text-foreground" : "rounded-br-sm bg-accent text-accent-foreground"
      )}>
        {children}
      </div>
    </div>
  );
}
