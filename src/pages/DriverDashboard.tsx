import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Star, Trophy, Car, MapPin, Calendar, CheckCircle2, Loader2, ChevronDown, Info, Inbox, Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Ride {
  id: string;
  patient_id: string;
  pickup_address: string;
  destination: string;
  requested_date: string;
  status: string;
  patient_name?: string;
}

interface LeaderRow {
  driver_id: string;
  credits: number;
  total_rides_completed: number;
  full_name: string;
}

const MILESTONES = [
  { rides: 5, label: "badge_helper", emoji: "🤝" },
  { rides: 25, label: "badge_champion", emoji: "⭐" },
  { rides: 50, label: "badge_hero", emoji: "🏆" },
];

function getBadge(rides: number): { emoji: string; key: string } {
  if (rides >= 50) return { emoji: "🏆", key: "badge_hero" };
  if (rides >= 25) return { emoji: "⭐", key: "badge_champion" };
  if (rides >= 5) return { emoji: "🤝", key: "badge_helper" };
  return { emoji: "🌱", key: "badge_seedling" };
}

function nextMilestone(rides: number) {
  for (const m of MILESTONES) if (rides < m.rides) return m;
  return null;
}

const RANK_BORDER = ["border-l-yellow-400", "border-l-zinc-400", "border-l-orange"];

export default function DriverDashboard() {
  const { profile, user } = useAuth();
  const { t, lang } = useLanguage();

  const [credits, setCredits] = useState<{ credits: number; total_rides_completed: number } | null>(null);
  const [openRides, setOpenRides] = useState<Ride[]>([]);
  const [acceptedRides, setAcceptedRides] = useState<Ride[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [howOpen, setHowOpen] = useState(false);

  const ensureCreditsRow = async () => {
    if (!user) return;
    const { data } = await supabase.from("volunteer_credits").select("*").eq("driver_id", user.id).maybeSingle();
    if (!data) {
      await supabase.from("volunteer_credits").insert({ driver_id: user.id, credits: 0, total_rides_completed: 0 });
    }
  };

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    await ensureCreditsRow();

    const [creditsRes, openRes, acceptedRes, lbRes] = await Promise.all([
      supabase.from("volunteer_credits").select("credits, total_rides_completed").eq("driver_id", user.id).maybeSingle(),
      supabase.from("ride_requests").select("*").eq("status", "open").order("requested_date", { ascending: true }),
      supabase.from("ride_requests").select("*").eq("matched_driver_id", user.id).eq("status", "matched").order("requested_date", { ascending: true }),
      supabase.from("volunteer_credits").select("driver_id, credits, total_rides_completed").order("credits", { ascending: false }).limit(10),
    ]);

    setCredits(creditsRes.data ?? { credits: 0, total_rides_completed: 0 });

    const allRides = [...(openRes.data ?? []), ...(acceptedRes.data ?? [])];
    const pIds = Array.from(new Set(allRides.map((r) => r.patient_id)));
    const nameMap = new Map<string, string>();
    if (pIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", pIds);
      profs?.forEach((p) => nameMap.set(p.id, p.full_name));
    }
    const enrich = (r: any): Ride => ({
      ...r,
      patient_name: (nameMap.get(r.patient_id) || "").split(" ")[0] || (lang === "es" ? "Paciente" : "Patient"),
    });
    setOpenRides((openRes.data ?? []).map(enrich));
    setAcceptedRides((acceptedRes.data ?? []).map(enrich));

    const lbIds = (lbRes.data ?? []).map((l) => l.driver_id);
    const lbNameMap = new Map<string, string>();
    if (lbIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", lbIds);
      profs?.forEach((p) => lbNameMap.set(p.id, p.full_name));
    }
    setLeaderboard(
      (lbRes.data ?? []).map((l) => ({
        ...l,
        full_name: lbNameMap.get(l.driver_id) || (lang === "es" ? "Conductor" : "Driver"),
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, lang]);

  const acceptRide = async (id: string) => {
    if (!user) return;
    setActing(id);
    const { error } = await supabase
      .from("ride_requests")
      .update({ status: "matched", matched_driver_id: user.id })
      .eq("id", id);
    setActing(null);
    if (error) toast.error(error.message);
    else {
      toast.success(`${t("rideAccepted")} +15 ⭐`);
      loadAll();
    }
  };

  const completeRide = async (id: string) => {
    if (!user || !credits) return;
    setActing(id);
    const { error: e1 } = await supabase.from("ride_requests").update({ status: "completed" }).eq("id", id);
    const { error: e2 } = await supabase
      .from("volunteer_credits")
      .update({
        credits: credits.credits + 15,
        total_rides_completed: credits.total_rides_completed + 1,
      })
      .eq("driver_id", user.id);
    setActing(null);
    if (e1 || e2) toast.error((e1 || e2)?.message || "Error");
    else {
      toast.success(t("rideCompleted"));
      loadAll();
    }
  };

  const totalRides = credits?.total_rides_completed ?? 0;
  const currentBadge = getBadge(totalRides);
  const next = nextMilestone(totalRides);
  const lastMilestone = [...MILESTONES].reverse().find((m) => m.rides <= totalRides)?.rides ?? 0;
  const progressPct = next
    ? Math.round(((totalRides - lastMilestone) / (next.rides - lastMilestone)) * 100)
    : 100;
  const ridesToNext = next ? next.rides - totalRides : 0;

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <AppShell title={t("driverDashboard")}>
      {/* Header */}
      <section className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{t("driverWelcome")}, {firstName}! 🚗</h2>
        <p className="text-sm text-muted-foreground">{t("driverSubtitle")}</p>
      </section>

      {/* Credits + Progress */}
      <section className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="overflow-hidden border-border/60 shadow-elevated">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Star className="h-4 w-4" fill="currentColor" />
              {t("communityCredits")}
            </div>
            <p className="mt-2 text-5xl font-bold tabular-nums">{loading ? "—" : credits?.credits ?? 0}</p>
            <p className="mt-1 text-xs opacity-80">{totalRides} {t("rides")}</p>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentBadge.emoji}</span>
              <div>
                <p className="text-xs text-muted-foreground">{lang === "es" ? "Insignia actual" : "Current badge"}</p>
                <p className="text-sm font-semibold">{t(currentBadge.key as any)}</p>
              </div>
            </div>
            <Trophy className="h-5 w-5 text-warning" />
          </div>
          {next ? (
            <div>
              <Progress value={progressPct} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {ridesToNext} {lang === "es" ? "viajes más para" : "more rides to"} <span className="font-medium text-foreground">{t(next.label as any)}</span> {next.emoji}
              </p>
            </div>
          ) : (
            <p className="text-xs text-success font-medium">🏆 {lang === "es" ? "¡Insignia máxima alcanzada!" : "Top badge unlocked!"}</p>
          )}
        </Card>
      </section>

      {/* Open rides */}
      <section className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          {t("availableRides")}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <span className="live-dot" />
            {t("liveLabel")}
          </span>
        </h3>
        {loading ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : openRides.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center shadow-card">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Inbox className="h-7 w-7" />
            </div>
            <p className="text-sm text-muted-foreground">{t("noRidesEmpty")}</p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {openRides.map((r) => (
              <Card key={r.id} className="border-l-4 border-l-success p-4 shadow-card transition-base hover:shadow-elevated">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold">{r.patient_name}</p>
                  <Badge className="bg-success/15 text-success border-0 text-xs hover:bg-success/15">{t("ride_open")}</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3 w-3 shrink-0" /> <span><span className="font-medium text-foreground">{lang === "es" ? "Recoger" : "Pickup"}:</span> {r.pickup_address}</span></p>
                  <p className="flex items-start gap-1.5"><Car className="mt-0.5 h-3 w-3 shrink-0" /> <span><span className="font-medium text-foreground">{t("destination")}:</span> {r.destination}</span></p>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(r.requested_date).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                    <span className="text-muted-foreground/70">~12 mi</span>
                  </div>
                </div>
                <Button
                  onClick={() => acceptRide(r.id)}
                  disabled={acting === r.id}
                  className="mt-3 w-full bg-success text-success-foreground hover:bg-success/90 gap-1.5"
                >
                  {acting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {t("acceptRide")} ✓
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Accepted rides */}
      {acceptedRides.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 text-lg font-semibold">{t("yourActiveRides")}</h3>
          <div className="space-y-2">
            {acceptedRides.map((r) => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(r.pickup_address)}&destination=${encodeURIComponent(r.destination)}&travelmode=driving`;
              return (
                <Card key={r.id} className="border-l-4 border-l-primary p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{r.patient_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.pickup_address} → {r.destination}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{new Date(r.requested_date).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation className="h-4 w-4" />
                          {lang === "es" ? "Ver ruta" : "Open in Maps"}
                        </a>
                      </Button>
                      <Button onClick={() => completeRide(r.id)} disabled={acting === r.id} size="sm" className="gradient-primary text-primary-foreground gap-1.5">
                        {acting === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {t("markComplete")}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      <section className="mb-6">
        <h3 className="mb-1 text-lg font-semibold">🏆 {t("leaderboard")}</h3>
        <p className="mb-3 text-xs text-muted-foreground">{t("topDrivers")}</p>
        <Card className="overflow-hidden shadow-card">
          <div className="grid grid-cols-[40px_1fr_70px_60px_50px] items-center gap-3 border-b border-border bg-secondary/60 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{t("rank")}</span>
            <span>{t("driver")}</span>
            <span className="text-right">{t("credits")}</span>
            <span className="text-right">{t("ridesCompleted")}</span>
            <span className="text-center">{t("badge")}</span>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : leaderboard.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">—</p>
          ) : (
            <ul>
              {leaderboard.map((row, idx) => {
                const b = getBadge(row.total_rides_completed);
                const isMe = row.driver_id === user?.id;
                const rankBorder = idx < 3 ? RANK_BORDER[idx] : "border-l-transparent";
                return (
                  <li
                    key={row.driver_id}
                    className={cn(
                      "grid grid-cols-[40px_1fr_70px_60px_50px] items-center gap-3 border-b border-l-4 border-border px-4 py-2.5 text-sm last:border-b-0",
                      rankBorder,
                      isMe && "bg-accent-soft"
                    )}
                  >
                    <span className={cn("font-bold", idx === 0 ? "text-yellow-500" : idx === 1 ? "text-zinc-400" : idx === 2 ? "text-orange" : "text-muted-foreground")}>
                      #{idx + 1}
                    </span>
                    <span className={cn("truncate", isMe && "font-semibold text-accent")}>
                      {row.full_name} {isMe && <span className="text-xs">({lang === "es" ? "tú" : "you"})</span>}
                    </span>
                    <span className="text-right font-semibold tabular-nums">{row.credits}</span>
                    <span className="text-right text-muted-foreground tabular-nums">{row.total_rides_completed}</span>
                    <span className="text-center text-lg" title={t(b.key as any)}>{b.emoji}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* How Credits Work (collapsible) */}
      <section className="mb-6">
        <Card className="overflow-hidden shadow-card">
          <button
            onClick={() => setHowOpen(!howOpen)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-base hover:bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold">{t("howCredits")}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-base", howOpen && "rotate-180")} />
          </button>
          {howOpen && (
            <div className="space-y-4 border-t border-border bg-secondary/30 px-5 py-5">
              <p className="text-sm leading-relaxed text-muted-foreground">{t("howCreditsBody")}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { e: "🌱", k: "badge_seedling", req: "0–4 rides" },
                  { e: "🤝", k: "badge_helper", req: "5–24 rides" },
                  { e: "⭐", k: "badge_champion", req: "25–49 rides" },
                  { e: "🏆", k: "badge_hero", req: "50+ rides" },
                ].map((m) => (
                  <div key={m.k} className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-card">
                    <span className="text-2xl">{m.e}</span>
                    <div>
                      <p className="text-sm font-semibold">{t(m.k as any)}</p>
                      <p className="text-xs text-muted-foreground">{m.req}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </section>
    </AppShell>
  );
}
