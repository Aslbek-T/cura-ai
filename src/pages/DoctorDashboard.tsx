import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { calculateAge, timeAgo } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Users, Calendar, Flag, ExternalLink, Loader2, Bot, Stethoscope, Sparkles,
  Search, MessageSquare, CheckCircle2, Send, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddPatientSheet } from "@/components/AddPatientSheet";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface PatientWithProfile {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  conditions: string[];
  medications: { name: string; dosage: string; frequency: string }[];
  allergies: string[];
}

interface Appointment {
  id: string;
  patient_id: string;
  scheduled_at: string;
  appointment_type: string;
  status: string;
  ai_brief: string | null;
  patient_name?: string;
}

interface FlaggedEvent {
  id: string;
  patient_id: string;
  content: Record<string, string>;
  created_at: string;
  patient_name?: string;
}

export default function DoctorDashboard() {
  const { profile, user } = useAuth();
  const { t, lang } = useLanguage();

  const [patients, setPatients] = useState<PatientWithProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [flagged, setFlagged] = useState<FlaggedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activePatient, setActivePatient] = useState<PatientWithProfile | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [activeEvents, setActiveEvents] = useState<any[]>([]);

  const [briefAppt, setBriefAppt] = useState<Appointment | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefText, setBriefText] = useState<string | null>(null);

  const [msgPatient, setMsgPatient] = useState<PatientWithProfile | null>(null);
  const [msgText, setMsgText] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  const [addPatientOpen, setAddPatientOpen] = useState(false);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);

    const { data: pats } = await supabase
      .from("patients")
      .select("id, conditions, medications, allergies")
      .eq("assigned_doctor_id", user.id);

    const ids = (pats ?? []).map((p) => p.id);

    const profMap = new Map<string, { full_name: string; date_of_birth: string | null }>();
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, date_of_birth")
        .in("id", ids);
      profs?.forEach((p) => profMap.set(p.id, { full_name: p.full_name, date_of_birth: p.date_of_birth }));
    }

    const merged: PatientWithProfile[] = (pats ?? []).map((p) => ({
      id: p.id,
      full_name: profMap.get(p.id)?.full_name ?? "Unknown",
      date_of_birth: profMap.get(p.id)?.date_of_birth ?? null,
      conditions: p.conditions ?? [],
      medications: (p.medications as any) ?? [],
      allergies: p.allergies ?? [],
    }));
    setPatients(merged);

    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", user.id)
      .neq("status", "completed")
      .order("scheduled_at", { ascending: true });
    const apptsWithNames = (appts ?? []).map((a) => ({
      ...a,
      patient_name: profMap.get(a.patient_id)?.full_name ?? "",
    }));
    setAppointments(apptsWithNames as Appointment[]);

    if (ids.length) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: events } = await supabase
        .from("health_timeline")
        .select("*")
        .in("patient_id", ids)
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: false });
      const flaggedOnly = (events ?? []).filter((e) => (e.content as any)?.flagged === "true");
      setFlagged(
        flaggedOnly.map((e) => ({
          id: e.id,
          patient_id: e.patient_id,
          content: e.content as any,
          created_at: e.created_at,
          patient_name: profMap.get(e.patient_id)?.full_name ?? "",
        }))
      );
    } else {
      setFlagged([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openSummary = async (p: PatientWithProfile) => {
    setActivePatient(p);
    setSummaryLoading(true);
    setSummaryText(null);
    setActiveEvents([]);
    const { data } = await supabase
      .from("health_timeline")
      .select("*")
      .eq("patient_id", p.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setActiveEvents(data ?? []);
    try {
      const res = await fetch(`${API_BASE}/api/ai-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: p.id }),
      });
      const data = await res.json();
      setSummaryText(data?.summary);
    } catch (e: any) {
      toast.error(e?.message || "Failed to fetch AI summary");
      setSummaryText(lang === "es" ? "No se pudo cargar el resumen IA." : "Could not load AI summary.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const openBrief = async (a: Appointment) => {
    setBriefAppt(a);
    setBriefLoading(true);
    setBriefText(null);
    try {
      const res = await fetch(`${API_BASE}/api/ai-brief`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: a.patient_id, appointmentId: a.id }),
      });
      const data = await res.json();
      setBriefText(data?.brief);
    } catch (e: any) {
      toast.error(e?.message || "Failed to fetch AI brief");
      setBriefText(lang === "es" ? "No se pudo cargar el brief IA." : "Could not load AI brief.");
    } finally {
      setBriefLoading(false);
    }
  };

  const updateApptStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("appointments").update({ status: newStatus }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(lang === "es" ? "Estado actualizado" : "Status updated");
      loadAll();
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setMsgSending(true);
    await new Promise((r) => setTimeout(r, 600));
    setMsgSending(false);
    toast.success(t("messageSent"));
    setMsgText("");
    setMsgPatient(null);
  };

  const flagCountFor = (patientId: string) =>
    flagged.filter((f) => f.patient_id === patientId).length;

  const dotColor = (n: number) =>
    n === 0 ? "bg-success" : n === 1 ? "bg-warning" : "bg-destructive";

  const today = new Date().toISOString().slice(0, 10);
  const flaggedToday = flagged.filter((f) => f.created_at.slice(0, 10) === today).length;
  const upcomingCount = appointments.filter((a) => a.status !== "cancelled").length;

  const docName = profile?.full_name?.replace(/^Dr\.?\s*/i, "") ?? "";

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      p.full_name.toLowerCase().includes(q) ||
      p.conditions.some((c) => c.toLowerCase().includes(q))
    );
  }, [patients, search]);

  return (
    <AppShell title={`Dr. ${docName} — Banner Health`}>
      {/* Header */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("welcomeDr")} {docName}</h2>
        <p className="text-sm text-muted-foreground">{t("clinicSubtitle")}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard icon={<Users className="h-4 w-4" />} label={t("totalPatients")} value={loading ? null : patients.length} />
          <StatCard icon={<Calendar className="h-4 w-4" />} label={t("upcomingApptsCount")} value={loading ? null : upcomingCount} />
          <StatCard icon={<Flag className="h-4 w-4" />} label={t("flaggedToday")} value={loading ? null : flaggedToday} accent />
          <BannerCard />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Patient roster */}
        <section className="h-auto">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{t("yourPatients")}</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-40 sm:w-48">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPatients")}
                  className="h-9 pl-8 text-sm"
                />
              </div>
              <Button
                size="sm"
                onClick={() => setAddPatientOpen(true)}
                className="gradient-primary text-primary-foreground gap-1 h-9"
              >
                <Plus className="h-3.5 w-3.5" />
                {lang === "es" ? "Agregar +" : "Add Patient +"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
          ) : filteredPatients.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground shadow-card">
              {patients.length ? (lang === "es" ? "Sin resultados" : "No matches") : (lang === "es" ? "Sin pacientes asignados" : "No patients assigned.")}
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredPatients.map((p) => {
                const flags = flagCountFor(p.id);
                const age = calculateAge(p.date_of_birth);
                return (
                  <Card key={p.id} className="p-4 shadow-card transition-base hover:shadow-elevated">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full", dotColor(flags))} aria-label={`${flags} flagged events`} />
                        <h4 className="font-semibold">{p.full_name}</h4>
                        {age && <span className="text-xs text-muted-foreground">{age} {t("age")}</span>}
                      </div>
                    </div>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {p.conditions.map((c) => (
                        <Badge key={c} className="bg-primary-soft text-primary border-0 text-xs font-medium hover:bg-primary-soft">{c}</Badge>
                      ))}
                    </div>
                    <p className="mb-3 text-xs text-muted-foreground">
                      {t("lastActivity")}: {flags > 0 ? (lang === "es" ? "actividad marcada" : "flagged activity") : (lang === "es" ? "estable" : "stable")}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => openSummary(p)}>
                        <Sparkles className="h-3.5 w-3.5 text-accent" />
                        {lang === "es" ? "Resumen IA" : "View AI Summary"}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setMsgPatient(p)}>
                        <MessageSquare className="h-3.5 w-3.5" />
                        {t("messagePatient")}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Appointments + Flagged */}
        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-lg font-semibold">{t("upcomingAppointments")}</h3>
            <Card className="overflow-hidden shadow-card">
              {loading ? (
                <div className="p-4"><Skeleton className="h-12 w-full" /></div>
              ) : appointments.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">{t("noAppointments")}</div>
              ) : (
                <ul className="divide-y divide-border">
                  {appointments.map((a) => (
                    <li key={a.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">{a.patient_name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {new Date(a.scheduled_at).toLocaleString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </p>
                          <Badge variant="outline" className="mt-1.5 text-xs">{a.appointment_type === "telehealth" ? t("telehealth") : t("inPerson")}</Badge>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <Select value={a.status} onValueChange={(v) => updateApptStatus(a.id, v)}>
                            <SelectTrigger className="h-8 text-xs w-[130px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">{t("status_scheduled")}</SelectItem>
                              <SelectItem value="confirmed">{t("status_confirmed")}</SelectItem>
                              <SelectItem value="completed">{t("status_completed")}</SelectItem>
                              <SelectItem value="cancelled">{t("status_cancelled")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs gap-1" onClick={() => openBrief(a)}>
                            <Bot className="h-3 w-3 text-accent" />
                            {t("viewAiBrief")}
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-border bg-muted/30 px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  🔗 {t("fhirNote")}
                </span>
              </div>
            </Card>
          </section>

          <section>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              ⚠️ {t("flaggedActivity")}
            </h3>
            <Card className="shadow-card">
              {loading ? (
                <div className="p-4"><Skeleton className="h-10 w-full" /></div>
              ) : flagged.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">{t("noFlagged")}</div>
              ) : (
                <ul className="divide-y divide-border">
                  {flagged.map((f) => (
                    <li key={f.id} className="flex items-start gap-3 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-soft text-orange">
                        <Flag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{f.patient_name}</p>
                          <span className="text-xs text-muted-foreground">{timeAgo(f.created_at, lang)}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {f.content[lang] || f.content.en || f.content.symptoms}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => {
                        const p = patients.find((pp) => pp.id === f.patient_id);
                        if (p) openSummary(p);
                      }}>
                        {t("review")}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </section>
        </div>
      </div>

      {/* Patient Summary Sheet */}
      <Sheet open={!!activePatient} onOpenChange={(o) => !o && setActivePatient(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              {activePatient?.full_name}
            </SheetTitle>
          </SheetHeader>
          {activePatient && (
            <div className="mt-6 space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("conditions")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {activePatient.conditions.map((c) => (
                    <Badge key={c} className="bg-primary-soft text-primary border-0 hover:bg-primary-soft">{c}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("medications")}</p>
                <ul className="space-y-1.5 text-sm">
                  {activePatient.medications.map((m, i) => (
                    <li key={i} className="rounded-md bg-secondary/50 px-3 py-2">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-muted-foreground"> · {m.dosage} · {m.frequency}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("allergies")}</p>
                <p className="text-sm">{activePatient.allergies.join(", ") || "—"}</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("recentActivity")}</p>
                <div className="space-y-2">
                  {activeEvents.map((e) => (
                    <div key={e.id} className="rounded-md border border-border p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold uppercase text-muted-foreground">{t(`evt_${e.event_type}` as any)}</span>
                        <span className="text-muted-foreground">{timeAgo(e.created_at, lang)}</span>
                      </div>
                      <p className="mt-1 text-foreground">{e.content[lang] || e.content.en}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl gradient-soft border border-accent/20 p-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">AI Summary</p>
                </div>
                {summaryLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("generatingSummary")}
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{summaryText}</p>
                )}
              </div>

              <Button className="w-full gradient-primary text-primary-foreground gap-1.5">
                <Calendar className="h-4 w-4" />
                {t("scheduleAppt")}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

  {/* AI Brief Dialog */}
  <Dialog
    open={!!briefAppt}
    onOpenChange={(o) => {
      if (!o) {
        setBriefAppt(null);
        setBriefText(null);
        setBriefLoading(false);
      }
    }}
  >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent" />
              {t("aiBrief")} — {briefAppt?.patient_name}
            </DialogTitle>
          </DialogHeader>
      <div className="rounded-lg gradient-soft border border-accent/20 p-4 text-sm leading-relaxed">
        {briefLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {lang === "es" ? "Generando..." : "Generating..."}
          </div>
        ) : (
          (briefText || briefAppt?.ai_brief || (lang === "es" ? "Sin resumen disponible." : "No AI brief available."))
        )}
      </div>
        </DialogContent>
      </Dialog>

      {/* Message Patient Dialog */}
      <Dialog open={!!msgPatient} onOpenChange={(o) => !o && setMsgPatient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {t("messagePatient")} — {msgPatient?.full_name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder={lang === "es" ? "Escribe tu mensaje..." : "Type your message..."}
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMsgPatient(null)}>{t("cancel")}</Button>
            <Button onClick={sendMessage} disabled={!msgText.trim() || msgSending} className="gradient-primary text-primary-foreground gap-1.5">
              {msgSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddPatientSheet open={addPatientOpen} onOpenChange={setAddPatientOpen} onSuccess={loadAll} />
    </AppShell>
  );
}

function StatCard({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: number | null; accent?: boolean }) {
  return (
    <Card className={cn("p-4 shadow-card", accent && "border-orange/30 bg-orange-soft/40")}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", accent ? "bg-orange/15 text-orange" : "bg-primary-soft text-primary")}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold">{value === null ? <Skeleton className="h-7 w-10" /> : value}</p>
    </Card>
  );
}

function BannerCard() {
  const { lang } = useLanguage();
  return (
    <Card className="p-4 shadow-card bg-success/5 border-success/30">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Banner HealthTrioConnect</p>
        <CheckCircle2 className="h-5 w-5 text-success" />
      </div>
      <Badge className="mt-2 border-0 bg-success/15 text-success text-xs hover:bg-success/15">
        {lang === "es" ? "Listo para Integrarse" : "Integration Ready"}
      </Badge>
    </Card>
  );
}
